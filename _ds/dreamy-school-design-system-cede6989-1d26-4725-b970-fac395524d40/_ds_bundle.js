/* @ds-bundle: {"format":3,"namespace":"DreamySchoolDesignSystem_cede69","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"286cb00427c2","components/core/Badge.jsx":"ea6528faed2c","components/core/Button.jsx":"9565329af39a","components/core/Card.jsx":"f4cd4b799028","components/core/Tag.jsx":"1a68380a386a","slides/SlideKit.jsx":"d83e82febd54"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DreamySchoolDesignSystem_cede69 = window.DreamySchoolDesignSystem_cede69 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizeMap = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 72
};
const ringTones = ['var(--sky-400)', 'var(--iris-400)', 'var(--aqua-500)', 'var(--blush)', 'var(--sun)'];

/**
 * Round avatar. Shows an image, or initials on a soft brand tint.
 */
function Avatar({
  src,
  name = '',
  size = 'md',
  ring = false,
  style,
  ...rest
}) {
  const px = sizeMap[size] || (typeof size === 'number' ? size : 44);
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
  const idx = (name.charCodeAt(0) || 0) % ringTones.length;
  const tint = ringTones[idx];
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: px,
      height: px,
      borderRadius: '50%',
      overflow: 'hidden',
      background: src ? 'var(--ink-100)' : 'var(--sky-100)',
      color: 'var(--sky-700)',
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: px * 0.38,
      flex: 'none',
      boxShadow: ring ? `0 0 0 3px var(--white), 0 0 0 5px ${tint}` : 'none',
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initials || '★');
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const tones = {
  brand: {
    bg: 'var(--sky-100)',
    fg: 'var(--sky-700)'
  },
  iris: {
    bg: 'var(--iris-100)',
    fg: 'var(--iris-700)'
  },
  aqua: {
    bg: 'var(--aqua-100)',
    fg: 'var(--aqua-700)'
  },
  success: {
    bg: 'var(--success-soft)',
    fg: '#1c7a4d'
  },
  warning: {
    bg: 'var(--warning-soft)',
    fg: '#9a6a12'
  },
  danger: {
    bg: 'var(--danger-soft)',
    fg: '#b23145'
  },
  neutral: {
    bg: 'var(--ink-100)',
    fg: 'var(--ink-700)'
  },
  solid: {
    bg: 'var(--grad-dream)',
    fg: 'var(--white)'
  }
};

/**
 * Small status / category label. Soft tinted pill by default.
 */
function Badge({
  children,
  tone = 'brand',
  dot = false,
  style,
  ...rest
}) {
  const t = tones[tone] || tones.brand;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: t.bg,
      color: t.fg,
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 12.5,
      letterSpacing: '0.01em',
      lineHeight: 1,
      padding: '6px 12px',
      borderRadius: 'var(--radius-pill)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: 'currentColor'
    }
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizes = {
  sm: {
    padding: '8px 16px',
    fontSize: 14,
    radius: 'var(--radius-pill)',
    gap: 6
  },
  md: {
    padding: '12px 22px',
    fontSize: 16,
    radius: 'var(--radius-pill)',
    gap: 8
  },
  lg: {
    padding: '16px 30px',
    fontSize: 18,
    radius: 'var(--radius-pill)',
    gap: 10
  }
};
const palette = {
  primary: {
    background: 'var(--grad-dream)',
    color: 'var(--white)',
    boxShadow: 'var(--shadow-sky)',
    border: '1px solid transparent'
  },
  secondary: {
    background: 'var(--white)',
    color: 'var(--sky-700)',
    boxShadow: 'var(--shadow-sm)',
    border: '1.5px solid var(--sky-300)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--sky-700)',
    boxShadow: 'none',
    border: '1.5px solid transparent'
  },
  soft: {
    background: 'var(--sky-100)',
    color: 'var(--sky-700)',
    boxShadow: 'none',
    border: '1px solid transparent'
  }
};

/**
 * Dreamy School pill button. Rounded, soft-shadowed, gentle hover lift.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled = false,
  fullWidth = false,
  onClick,
  style,
  ...rest
}) {
  const s = sizes[size] || sizes.md;
  const p = palette[variant] || palette.primary;
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const base = {
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : undefined,
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: s.fontSize,
    lineHeight: 1,
    letterSpacing: '-0.01em',
    padding: s.padding,
    borderRadius: s.radius,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'transform var(--dur-fast) var(--ease-soft), box-shadow var(--dur-base) var(--ease-soft), background var(--dur-base) var(--ease-soft)',
    transform: press ? 'translateY(0) scale(0.97)' : hover && !disabled ? 'translateY(-2px)' : 'none',
    ...p,
    ...(hover && !disabled && variant === 'ghost' ? {
      background: 'var(--sky-50)'
    } : null),
    ...(hover && !disabled && variant === 'soft' ? {
      background: 'var(--sky-200)'
    } : null),
    ...(hover && !disabled && variant === 'secondary' ? {
      borderColor: 'var(--sky-500)'
    } : null),
    ...(hover && !disabled && variant === 'primary' ? {
      boxShadow: '0 18px 40px rgba(0,167,225,0.32)'
    } : null),
    ...style
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    onClick: onClick,
    style: base,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false)
  }, rest), icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      fontSize: '1.1em'
    }
  }, icon) : null, children, iconRight ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      fontSize: '1.1em'
    }
  }, iconRight) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Soft rounded surface container with gentle cloud shadow.
 */
function Card({
  children,
  padding = 'var(--space-6)',
  interactive = false,
  tone = 'default',
  style,
  onClick,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const tones = {
    default: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-soft)'
    },
    sky: {
      background: 'var(--sky-50)',
      border: '1px solid var(--sky-200)'
    },
    iris: {
      background: 'var(--iris-50)',
      border: '1px solid var(--iris-200)'
    },
    glass: {
      background: 'rgba(255,255,255,0.7)',
      backdropFilter: 'var(--blur-glass)',
      WebkitBackdropFilter: 'var(--blur-glass)',
      border: '1px solid rgba(255,255,255,0.6)'
    }
  };
  const t = tones[tone] || tones.default;
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      borderRadius: 'var(--radius-lg)',
      padding,
      boxShadow: interactive && hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
      transform: interactive && hover ? 'translateY(-3px)' : 'none',
      transition: 'transform var(--dur-base) var(--ease-soft), box-shadow var(--dur-base) var(--ease-soft)',
      cursor: interactive ? 'pointer' : 'default',
      ...t,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Outlined, removable tag / chip. For filters, subjects and interests.
 */
function Tag({
  children,
  selected = false,
  onRemove,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("span", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      fontFamily: 'var(--font-body)',
      fontWeight: 700,
      fontSize: 14,
      lineHeight: 1,
      padding: '8px 14px',
      borderRadius: 'var(--radius-pill)',
      cursor: onClick ? 'pointer' : 'default',
      color: selected ? 'var(--white)' : 'var(--ink-700)',
      background: selected ? 'var(--sky-500)' : hover && onClick ? 'var(--sky-50)' : 'var(--white)',
      border: `1.5px solid ${selected ? 'var(--sky-500)' : 'var(--ink-200)'}`,
      transition: 'all var(--dur-fast) var(--ease-soft)',
      ...style
    }
  }, rest), children, onRemove ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: e => {
      e.stopPropagation();
      onRemove(e);
    },
    "aria-label": "Remove",
    style: {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: 'currentColor',
      opacity: 0.6,
      fontSize: 16,
      lineHeight: 1,
      padding: 0,
      display: 'inline-flex'
    }
  }, "\xD7") : null);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// slides/SlideKit.jsx
try { (() => {
/* Dreamy School — Slide Kit
   Reusable 1280×720 slide-type components for decks. Rendered with the brand
   tokens from styles.css. Photography is represented by <PhotoSlot> placeholders —
   drop real classroom/student imagery in for production.
   Exposes everything on window so each slide-type card HTML can mount one type. */

const A = '../assets'; // asset base relative to /slides/*.html

/* ---------- shared bits ---------- */
function PhotoSlot({
  label = 'Classroom photo',
  style,
  radius = 'var(--radius-xl)',
  grad = 'var(--grad-dawn)'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: radius,
      background: grad,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'var(--shadow-md)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: 0.16,
      backgroundImage: `url(${A}/mark-white.png)`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: '46%'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 9,
      background: 'rgba(255,255,255,0.78)',
      backdropFilter: 'var(--blur-glass)',
      WebkitBackdropFilter: 'var(--blur-glass)',
      borderRadius: 'var(--radius-pill)',
      padding: '9px 18px',
      color: 'var(--ink-700)',
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 15
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: 3,
      background: 'var(--sky-500)'
    }
  }), label));
}
function Eyebrow({
  children,
  color = 'var(--color-brand)'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 16,
      letterSpacing: 'var(--ls-caps)',
      textTransform: 'uppercase',
      color
    }
  }, children);
}
function Wordmark({
  white = false,
  height = 30
}) {
  return /*#__PURE__*/React.createElement("img", {
    src: `${A}/logo-dreamy-school${white ? '-white' : ''}.png`,
    alt: "Dreamy School",
    style: {
      height,
      display: 'block'
    }
  });
}
function MarkBadge({
  size = 56
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: 'var(--radius-md)',
      flex: 'none',
      background: 'var(--grad-dream)',
      boxShadow: 'var(--shadow-sky)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `${A}/mark-white.png`,
    alt: "",
    style: {
      height: size * 0.52
    }
  }));
}
function Footer({
  label,
  index,
  dark = false
}) {
  const c = dark ? 'rgba(255,255,255,0.78)' : 'var(--text-muted)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 'var(--slide-pad)',
      right: 'var(--slide-pad)',
      bottom: 38,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      fontWeight: 600,
      color: c
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    white: dark,
    height: 20
  })), /*#__PURE__*/React.createElement("div", null, label, index != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.5
    }
  }, '  ·  ', index) : null));
}
function Slide({
  children,
  bg = 'var(--surface-card)',
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 'var(--slide-w)',
      height: 'var(--slide-h)',
      background: bg,
      overflow: 'hidden',
      fontFamily: 'var(--font-body)',
      color: 'var(--text-body)',
      ...style
    }
  }, children);
}
const pad = {
  position: 'absolute',
  inset: 'var(--slide-pad)'
};

/* ---------- 1. Title ---------- */
function TitleSlide() {
  return /*#__PURE__*/React.createElement(Slide, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -160,
      right: -160,
      width: 520,
      height: 520,
      borderRadius: '50%',
      background: 'var(--grad-haze)',
      filter: 'blur(6px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...pad,
      display: 'flex',
      gap: 56,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1.1,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      marginBottom: 30
    }
  }, /*#__PURE__*/React.createElement(MarkBadge, {
    size: 52
  }), /*#__PURE__*/React.createElement(Wordmark, {
    height: 28
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Student Workshop \xB7 Spring 2026")), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 'var(--fs-display)',
      lineHeight: 'var(--lh-display)',
      letterSpacing: 'var(--ls-tight)',
      color: 'var(--text-strong)'
    }
  }, "Learning that", /*#__PURE__*/React.createElement("br", null), "feels like", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--grad-dream)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent'
    }
  }, "dreaming.")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '24px 0 0',
      fontSize: 'var(--fs-lead)',
      lineHeight: 'var(--lh-lead)',
      color: 'var(--text-body)',
      maxWidth: 460,
      fontWeight: 500
    }
  }, "A calm, joyful classroom for every student, teacher and family.")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 0.9,
      alignSelf: 'stretch',
      paddingTop: 28,
      paddingBottom: 28
    }
  }, /*#__PURE__*/React.createElement(PhotoSlot, {
    label: "Students collaborating",
    style: {
      width: '100%',
      height: '100%'
    }
  }))));
}

/* ---------- 2. Section divider ---------- */
function SectionSlide() {
  return /*#__PURE__*/React.createElement(Slide, {
    bg: "var(--grad-dream)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: -200,
      left: -120,
      width: 480,
      height: 480,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.10)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...pad,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 120,
      lineHeight: 1,
      color: 'rgba(255,255,255,0.35)'
    }
  }, "01"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 5,
      borderRadius: 3,
      background: 'rgba(255,255,255,0.7)',
      margin: '20px 0 24px'
    }
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 60,
      lineHeight: 1.05,
      letterSpacing: 'var(--ls-tight)',
      color: 'var(--white)',
      maxWidth: 760
    }
  }, "How we learn together"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '20px 0 0',
      fontSize: 'var(--fs-lead)',
      color: 'rgba(255,255,255,0.85)',
      maxWidth: 560,
      fontWeight: 500
    }
  }, "Three ideas that shape every Dreamy School classroom.")), /*#__PURE__*/React.createElement(Footer, {
    label: "Section",
    index: "01",
    dark: true
  }));
}

/* ---------- 3. Content + photo ---------- */
function ContentSlide() {
  const points = [['Start with curiosity', 'Every lesson opens with a question worth wondering about.'], ['Practice gently', 'Small, frequent steps beat one big leap — and feel kinder.'], ['Celebrate growth', 'We notice progress out loud, for every single student.']];
  return /*#__PURE__*/React.createElement(Slide, null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...pad,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Our approach")), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 30px',
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 'var(--fs-h1)',
      lineHeight: 'var(--lh-h1)',
      letterSpacing: 'var(--ls-snug)',
      color: 'var(--text-strong)'
    }
  }, "A classroom that cares"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 48,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      flex: 1,
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 22
    }
  }, points.map(([t, d], i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      display: 'flex',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 34,
      height: 34,
      flex: 'none',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--sky-100)',
      color: 'var(--sky-600)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 16
    }
  }, i + 1), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 'var(--fs-h4)',
      color: 'var(--text-strong)'
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-body)',
      lineHeight: 'var(--lh-body)',
      color: 'var(--text-muted)',
      marginTop: 3
    }
  }, d))))), /*#__PURE__*/React.createElement(PhotoSlot, {
    label: "Teacher with students",
    grad: "var(--grad-haze)",
    style: {
      flex: 0.95
    }
  }))), /*#__PURE__*/React.createElement(Footer, {
    label: "Our approach",
    index: "02"
  }));
}

/* ---------- 4. Full-bleed photo ---------- */
function PhotoSlide() {
  return /*#__PURE__*/React.createElement(Slide, null, /*#__PURE__*/React.createElement(PhotoSlot, {
    label: "Full-bleed classroom moment",
    radius: "0",
    grad: "var(--grad-dawn)",
    style: {
      position: 'absolute',
      inset: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(90deg, rgba(14,36,56,0.55) 0%, rgba(14,36,56,0.0) 55%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 'var(--slide-pad)',
      bottom: 110,
      maxWidth: 560
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    color: "rgba(255,255,255,0.9)"
  }, "In the classroom")), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 'var(--fs-h1)',
      lineHeight: 1.04,
      letterSpacing: 'var(--ls-tight)',
      color: 'var(--white)'
    }
  }, "Where wonder meets work"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '16px 0 0',
      fontSize: 'var(--fs-lead)',
      color: 'rgba(255,255,255,0.9)',
      fontWeight: 500
    }
  }, "Real students, real progress, every day.")), /*#__PURE__*/React.createElement(Footer, {
    label: "Gallery",
    index: "03",
    dark: true
  }));
}

/* ---------- 5. Stats ---------- */
function StatSlide() {
  const stats = [['12k+', 'Students learning', 'var(--grad-sky)'], ['98%', 'Feel more confident', 'var(--grad-dream)'], ['340', 'Schools onboard', 'var(--grad-aqua)']];
  return /*#__PURE__*/React.createElement(Slide, {
    bg: "var(--surface-sky)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...pad,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "By the numbers")), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 40px',
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 'var(--fs-h1)',
      lineHeight: 'var(--lh-h1)',
      letterSpacing: 'var(--ls-snug)',
      color: 'var(--text-strong)'
    }
  }, "Growth you can feel"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24,
      flex: 1,
      alignItems: 'stretch'
    }
  }, stats.map(([n, l, g], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      background: 'var(--white)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      padding: 36,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 88,
      lineHeight: 1,
      letterSpacing: 'var(--ls-tight)',
      background: g,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent'
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-lead)',
      fontWeight: 600,
      color: 'var(--text-body)',
      marginTop: 14
    }
  }, l))))), /*#__PURE__*/React.createElement(Footer, {
    label: "By the numbers",
    index: "04"
  }));
}

/* ---------- 6. Quote ---------- */
function QuoteSlide() {
  return /*#__PURE__*/React.createElement(Slide, {
    bg: "var(--surface-iris)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 60,
      left: 'var(--slide-pad)',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 200,
      lineHeight: 0.7,
      color: 'var(--iris-200)'
    }
  }, "\u201C"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...pad,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("blockquote", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 46,
      lineHeight: 1.22,
      letterSpacing: 'var(--ls-snug)',
      color: 'var(--text-strong)',
      maxWidth: 900
    }
  }, "My daughter used to dread homework. Now she runs to show me what she learned."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      marginTop: 34
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: 'var(--grad-dream)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 20,
      boxShadow: 'var(--shadow-iris)'
    }
  }, "RA"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 18,
      color: 'var(--text-strong)'
    }
  }, "Renee A."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: 'var(--text-muted)'
    }
  }, "Parent \xB7 Grade 6")))), /*#__PURE__*/React.createElement(Footer, {
    label: "Voices",
    index: "05"
  }));
}

/* ---------- 7. Comparison ---------- */
function ComparisonSlide() {
  const cols = [['Before Dreamy', ['Homework felt like a chore', 'One pace for everyone', 'Progress hard to see'], 'var(--ink-100)', 'var(--ink-700)', 'var(--ink-400)'], ['With Dreamy', ['Learning feels playful', 'Paced to each student', 'Growth celebrated daily'], 'var(--grad-dream)', '#fff', 'rgba(255,255,255,0.55)']];
  return /*#__PURE__*/React.createElement(Slide, null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...pad,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "The difference")), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 32px',
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 'var(--fs-h1)',
      lineHeight: 'var(--lh-h1)',
      letterSpacing: 'var(--ls-snug)',
      color: 'var(--text-strong)'
    }
  }, "A gentler way to learn"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24,
      flex: 1
    }
  }, cols.map(([title, items, bg, fg, dotc], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      background: bg,
      borderRadius: 'var(--radius-lg)',
      padding: 34,
      boxShadow: i === 1 ? 'var(--shadow-sky)' : 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 'var(--fs-h3)',
      color: fg,
      marginBottom: 20
    }
  }, title), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, items.map((t, j) => /*#__PURE__*/React.createElement("li", {
    key: j,
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      fontSize: 'var(--fs-lead)',
      color: fg,
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: '50%',
      background: dotc,
      flex: 'none'
    }
  }), t))))))), /*#__PURE__*/React.createElement(Footer, {
    label: "The difference",
    index: "06"
  }));
}

/* ---------- 8. Closing ---------- */
function ClosingSlide() {
  return /*#__PURE__*/React.createElement(Slide, {
    bg: "var(--grad-dream)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -140,
      right: -140,
      width: 460,
      height: 460,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.10)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...pad,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 28
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    white: true,
    height: 34
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: 84,
      lineHeight: 1.02,
      letterSpacing: 'var(--ls-tight)',
      color: 'var(--white)'
    }
  }, "Let's make learning", /*#__PURE__*/React.createElement("br", null), "feel like dreaming."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 28,
      marginTop: 36,
      fontSize: 'var(--fs-lead)',
      color: 'rgba(255,255,255,0.92)',
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("span", null, "hello@dreamyschool.net"), /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.5
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "dreamyschool.net"))));
}
const DEMO_SLIDES = [TitleSlide, SectionSlide, ContentSlide, PhotoSlide, StatSlide, QuoteSlide, ComparisonSlide, ClosingSlide];
Object.assign(window, {
  PhotoSlot,
  Eyebrow,
  Wordmark,
  MarkBadge,
  Footer,
  Slide,
  TitleSlide,
  SectionSlide,
  ContentSlide,
  PhotoSlide,
  StatSlide,
  QuoteSlide,
  ComparisonSlide,
  ClosingSlide,
  DEMO_SLIDES
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "slides/SlideKit.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Tag = __ds_scope.Tag;

})();
