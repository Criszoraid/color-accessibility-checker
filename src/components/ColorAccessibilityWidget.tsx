import React, { useState, useEffect } from 'react';
import { Check, X, RefreshCw, Loader, Globe } from 'lucide-react';

interface ColorAccessibilityWidgetProps {
    initialFg?: string;
    initialBg?: string;
}

interface ColorCombination {
    fg: string;
    bg: string;
    ratio: number;
    aaNormal: boolean;
    aaaNormal: boolean;
    aaLarge: boolean;
    aaaLarge: boolean;
}

// Helper functions
const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
};

const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const getContrastRatio = (fg: string, bg: string) => {
    const rgb1 = hexToRgb(fg);
    const rgb2 = hexToRgb(bg);

    if (!rgb1 || !rgb2) return 0;

    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
};

const ColorAccessibilityWidget: React.FC<ColorAccessibilityWidgetProps> = ({
    initialFg = '#FFFFFF',
    initialBg = '#000000',
}) => {
    const [fgColor, setFgColor] = useState(initialFg);
    const [bgColor, setBgColor] = useState(initialBg);
    const [contrast, setContrast] = useState(0);

    // URL Feature State
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Palette State
    const [palette, setPalette] = useState<string[]>([]);
    const [combinations, setCombinations] = useState<ColorCombination[]>([]);

    useEffect(() => {
        const ratio = getContrastRatio(fgColor, bgColor);
        setContrast(parseFloat(ratio.toFixed(2)));
    }, [fgColor, bgColor]);

    const getStatus = (ratio: number, threshold: number) => {
        return ratio >= threshold ? 'pass' : 'fail';
    };

    const swapColors = () => {
        setFgColor(bgColor);
        setBgColor(fgColor);
    };

    const generateCombinations = (colors: string[]) => {
        const combos: ColorCombination[] = [];

        // Filter out duplicate colors and invalid hex codes
        const uniqueColors = [...new Set(colors)].filter(c => /^#[0-9A-F]{6}$/i.test(c));

        for (let i = 0; i < uniqueColors.length; i++) {
            for (let j = 0; j < uniqueColors.length; j++) {
                if (i === j) continue;

                const fg = uniqueColors[i];
                const bg = uniqueColors[j];
                const ratio = getContrastRatio(fg, bg);
                const roundedRatio = parseFloat(ratio.toFixed(2));

                // Only add if it passes at least AA Large (3:1) to reduce noise,
                // or keep all if user wants to see failures too.
                // Let's keep all but sort by best contrast.
                combos.push({
                    fg,
                    bg,
                    ratio: roundedRatio,
                    aaNormal: roundedRatio >= 4.5,
                    aaaNormal: roundedRatio >= 7,
                    aaLarge: roundedRatio >= 3,
                    aaaLarge: roundedRatio >= 4.5
                });
            }
        }

        // Sort by contrast ratio descending
        return combos.sort((a, b) => b.ratio - a.ratio);
    };

    const fetchColorsFromUrl = async () => {
        if (!url) return;

        setIsLoading(true);
        setError(null);
        setPalette([]);
        setCombinations([]);

        try {
            // Add protocol if missing
            const processedUrl = url.startsWith('http') ? url : `https://${url}`;
            const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(processedUrl)}&palette=true`);
            const data = await response.json();

            if (data.status === 'success') {
                const imagePalette = data.data.image?.palette || [];
                const logoPalette = data.data.logo?.palette || [];

                // Combine palettes
                const fullPalette = [...new Set([...imagePalette, ...logoPalette])];
                setPalette(fullPalette);

                if (fullPalette.length > 0) {
                    setCombinations(generateCombinations(fullPalette));
                }

                // Try to get colors from palette or fallbacks for main display
                const newBg = data.data.image?.background_color ||
                    (imagePalette[0]) ||
                    '#000000';

                const newFg = data.data.image?.color ||
                    (imagePalette[1]) ||
                    (logoPalette[0]) ||
                    '#FFFFFF';

                setBgColor(newBg);
                setFgColor(newFg);
            } else {
                setError('Could not extract colors');
            }
        } catch (err) {
            setError('Failed to fetch URL data');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const StatusBadge = ({ label, passed }: { label: string; passed: boolean }) => (
        <div className={`status-badge ${passed ? 'pass' : 'fail'}`}>
            <span className="status-label">{label}</span>
            {passed ? <Check size={16} /> : <X size={16} />}
        </div>
    );

    return (
        <div className="widget-container">
            <div className="widget-header">
                <h2>Color Accessibility</h2>
                <p>Check contrast ratio & WCAG compliance</p>
            </div>

            <div className="url-input-section">
                <div className="input-wrapper url-wrapper">
                    <Globe size={16} className="input-icon" />
                    <input
                        type="text"
                        placeholder="Enter website URL (e.g. google.com)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchColorsFromUrl()}
                        className="url-input"
                    />
                    <button
                        className="analyze-button"
                        onClick={fetchColorsFromUrl}
                        disabled={isLoading || !url}
                    >
                        {isLoading ? <Loader size={16} className="animate-spin" /> : 'Analyze'}
                    </button>
                </div>
                {error && <p className="error-message">{error}</p>}
            </div>

            <div className="controls-grid">
                <div className="color-input-group">
                    <label>Foreground</label>
                    <div className="input-wrapper">
                        <input
                            type="color"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                        />
                        <input
                            type="text"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                            className="hex-input"
                        />
                    </div>
                </div>

                <button className="swap-button" onClick={swapColors} aria-label="Swap colors">
                    <RefreshCw size={20} />
                </button>

                <div className="color-input-group">
                    <label>Background</label>
                    <div className="input-wrapper">
                        <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                        />
                        <input
                            type="text"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="hex-input"
                        />
                    </div>
                </div>
            </div>

            <div className="preview-card" style={{ backgroundColor: bgColor, color: fgColor }}>
                <div className="preview-content">
                    <h3 className="preview-title">Preview Text</h3>
                    <p className="preview-body">
                        This is how your text looks on the background.
                        Ensure it is readable for everyone.
                    </p>
                </div>
                <div className="contrast-display">
                    <span className="contrast-value">{contrast}</span>
                    <span className="contrast-label">Ratio</span>
                </div>
            </div>

            <div className="results-grid">
                <div className="result-column">
                    <h4>Normal Text</h4>
                    <div className="result-item">
                        <span>WCAG AA (4.5:1)</span>
                        <StatusBadge label={getStatus(contrast, 4.5).toUpperCase()} passed={contrast >= 4.5} />
                    </div>
                    <div className="result-item">
                        <span>WCAG AAA (7:1)</span>
                        <StatusBadge label={getStatus(contrast, 7).toUpperCase()} passed={contrast >= 7} />
                    </div>
                </div>
                <div className="result-column">
                    <h4>Large Text</h4>
                    <div className="result-item">
                        <span>WCAG AA (3:1)</span>
                        <StatusBadge label={getStatus(contrast, 3).toUpperCase()} passed={contrast >= 3} />
                    </div>
                    <div className="result-item">
                        <span>WCAG AAA (4.5:1)</span>
                        <StatusBadge label={getStatus(contrast, 4.5).toUpperCase()} passed={contrast >= 4.5} />
                    </div>
                </div>
            </div>

            {palette.length > 0 && (
                <div className="palette-section">
                    <h4>Extracted Palette</h4>
                    <div className="palette-grid">
                        {palette.map((color, idx) => (
                            <div
                                key={idx}
                                className="palette-swatch"
                                style={{ backgroundColor: color }}
                                onClick={() => setFgColor(color)}
                                title={color}
                            />
                        ))}
                    </div>
                </div>
            )}

            {combinations.length > 0 && (
                <div className="combinations-section">
                    <h4>Accessible Combinations</h4>
                    <div className="combinations-list">
                        {combinations.filter(c => c.aaLarge).map((combo, idx) => (
                            <div key={idx} className="combo-card" style={{ backgroundColor: combo.bg, color: combo.fg }}>
                                <div className="combo-info">
                                    <span className="combo-ratio">{combo.ratio}</span>
                                    <div className="combo-badges">
                                        {combo.aaaNormal && <span className="mini-badge">AAA</span>}
                                        {combo.aaNormal && !combo.aaaNormal && <span className="mini-badge">AA</span>}
                                        {combo.aaLarge && !combo.aaNormal && <span className="mini-badge">AA Large</span>}
                                    </div>
                                </div>
                                <div className="combo-text">Aa</div>
                            </div>
                        ))}
                    </div>
                    {combinations.filter(c => c.aaLarge).length === 0 && (
                        <p className="no-combos">No accessible combinations found in this palette.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ColorAccessibilityWidget;
