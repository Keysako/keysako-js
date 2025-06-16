import { buttonThemes, getButtonStyles } from '../src/themes';

describe('buttonThemes', () => {
  it('should export button themes object', () => {
    expect(buttonThemes).toBeDefined();
    expect(typeof buttonThemes).toBe('object');
  });

  it('should contain default theme', () => {
    expect(buttonThemes.default).toBeDefined();
    expect(buttonThemes.default.background).toBe('linear-gradient(135deg, #6e8efb, #a777e3)');
    expect(buttonThemes.default.color).toBe('#fff');
    expect(buttonThemes.default.border).toBe('none');
    expect(buttonThemes.default.hoverBg).toBe('linear-gradient(135deg, #5d7df9, #9566d9)');
    expect(buttonThemes.default.shadow).toBe('0 2px 4px rgba(0, 0, 0, 0.2)');
    expect(buttonThemes.default.textShadow).toBe('0 1px 2px rgba(0, 0, 0, 0.1)');
  });

  it('should contain light theme', () => {
    expect(buttonThemes.light).toBeDefined();
    expect(buttonThemes.light.background).toBe('#ffffff');
    expect(buttonThemes.light.color).toBe('#757575');
    expect(buttonThemes.light.border).toBe('1px solid #dadce0');
    expect(buttonThemes.light.hoverBg).toBe('#f8f8f8');
    expect(buttonThemes.light.shadow).toBe('0 1px 3px rgba(0, 0, 0, 0.08)');
  });

  it('should contain dark theme', () => {
    expect(buttonThemes.dark).toBeDefined();
    expect(buttonThemes.dark.background).toBe('#202124');
    expect(buttonThemes.dark.color).toBe('#ffffff');
    expect(buttonThemes.dark.border).toBe('1px solid #5f6368');
    expect(buttonThemes.dark.hoverBg).toBe('#303134');
    expect(buttonThemes.dark.shadow).toBe('0 2px 4px rgba(0, 0, 0, 0.25)');
  });

  it('should have consistent theme structure', () => {
    const requiredProperties = ['background', 'color', 'border', 'hoverBg', 'shadow'];

    Object.values(buttonThemes).forEach(theme => {
      requiredProperties.forEach(prop => {
        expect(theme).toHaveProperty(prop);
        expect(typeof theme[prop as keyof typeof theme]).toBe('string');
      });
    });
  });
});

describe('getButtonStyles', () => {
  it('should return CSS styles as string', () => {
    const styles = getButtonStyles();
    expect(typeof styles).toBe('string');
    expect(styles.length).toBeGreaterThan(0);
  });

  it('should contain host styles', () => {
    const styles = getButtonStyles();
    expect(styles).toContain(':host');
    expect(styles).toContain('display: inline-block');
  });

  it('should contain identity-button class styles', () => {
    const styles = getButtonStyles();
    expect(styles).toContain('.identity-button');
    expect(styles).toContain('display: inline-flex');
    expect(styles).toContain('align-items: center');
    expect(styles).toContain('justify-content: center');
  });

  it('should contain CSS custom properties', () => {
    const styles = getButtonStyles();
    expect(styles).toContain('var(--keysako-btn-bg)');
    expect(styles).toContain('var(--keysako-btn-color)');
    expect(styles).toContain('var(--keysako-btn-border)');
    expect(styles).toContain('var(--keysako-btn-shadow)');
    expect(styles).toContain('var(--keysako-btn-radius)');
  });

  it('should contain SVG styles', () => {
    const styles = getButtonStyles();
    expect(styles).toContain('.identity-button svg');
    expect(styles).toContain('width: 24px');
    expect(styles).toContain('height: 24px');
    expect(styles).toContain('stroke: currentColor');
  });

  it('should contain logo-only button styles', () => {
    const styles = getButtonStyles();
    expect(styles).toContain('.identity-button.logo-only');
    expect(styles).toContain('padding: 8px');
    expect(styles).toContain('width: 40px');
    expect(styles).toContain('height: 40px');
    expect(styles).toContain('aspect-ratio: 1');
  });

  it('should contain age badge styles', () => {
    const styles = getButtonStyles();
    expect(styles).toContain('.age-badge');
    expect(styles).toContain('font-size: 12px');
    expect(styles).toContain('font-weight: 600');
    expect(styles).toContain('border-radius: 9999px');
  });

  it('should contain hover styles', () => {
    const styles = getButtonStyles();
    expect(styles).toContain('.identity-button:hover');
    expect(styles).toContain('var(--keysako-btn-hover-bg)');
  });

  it('should contain responsive SVG styles for non-logo-only buttons', () => {
    const styles = getButtonStyles();
    expect(styles).toContain('.identity-button:not(.logo-only) svg');
    expect(styles).toContain('width: 18px');
    expect(styles).toContain('height: 18px');
    expect(styles).toContain('margin-right: 8px');
  });

  it('should contain positioned age badge styles for logo-only buttons', () => {
    const styles = getButtonStyles();
    expect(styles).toContain('.identity-button.logo-only .age-badge');
    expect(styles).toContain('position: absolute');
    expect(styles).toContain('top: -6px');
    expect(styles).toContain('right: -6px');
  });
});
