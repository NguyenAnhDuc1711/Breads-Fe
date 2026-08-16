"use client";

import React, {
  createContext,
  CSSProperties,
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import NextLink from "next/link";
import { useColorMode, useColorModeValue } from "../../context/ThemeContext";
import theme from "../../../theme";

export { useColorMode, useColorModeValue };

// ---------------------------------------------------------------------------
// A full drop-in replacement for the @chakra-ui/react components this app
// uses. Every scale table / default style below is copied verbatim from
// Chakra's own source (node_modules/@chakra-ui/theme, @chakra-ui/react)
// rather than guessed, so both simple style-prop wrappers (Box/Flex/Text/...)
// and interactive components (Modal/Menu/Popover/Tabs/Accordion/...) match
// Chakra's real defaults. Positioning for Menu/Popover uses a fixed-position
// + getBoundingClientRect approach instead of Popper.js, and Modal/Menu skip
// focus-trap — deliberate simplifications, not oversights.
// ---------------------------------------------------------------------------

// Chakra's `space` scale: numeric keys are n * 0.25rem (4px) steps; "px" is
// the one literal-string exception.
function spaceProp(val: any): string | undefined {
  const resolved = resolveResponsive(val);
  if (resolved === undefined || resolved === null) return undefined;
  if (typeof resolved === "number") return `${resolved * 4}px`;
  if (resolved === "px") return "1px";
  return String(resolved);
}

// Chakra's `sizes` scale extends `space` with named large tokens.
const SIZE_TOKENS: Record<string, string> = {
  max: "max-content",
  min: "min-content",
  full: "100%",
  "3xs": "14rem",
  "2xs": "16rem",
  xs: "20rem",
  sm: "24rem",
  md: "28rem",
  lg: "32rem",
  xl: "36rem",
  "2xl": "42rem",
  "3xl": "48rem",
  "4xl": "56rem",
  "5xl": "64rem",
  "6xl": "72rem",
  "7xl": "80rem",
  "8xl": "90rem",
  prose: "60ch",
};

function sizeProp(val: any): string | undefined {
  const resolved = resolveResponsive(val);
  if (resolved === undefined || resolved === null) return undefined;
  if (typeof resolved === "number") return `${resolved * 4}px`;
  if (typeof resolved === "string" && SIZE_TOKENS[resolved])
    return SIZE_TOKENS[resolved];
  if (resolved === "px") return "1px";
  return String(resolved);
}

const RADII: Record<string, string> = {
  none: "0",
  sm: "0.125rem",
  base: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px",
};

function radiusProp(val: any): string | undefined {
  const resolved = resolveResponsive(val);
  if (resolved === undefined || resolved === null) return undefined;
  if (typeof resolved === "string" && RADII[resolved] !== undefined)
    return RADII[resolved];
  if (typeof resolved === "number") return `${resolved}px`;
  return String(resolved);
}

const FONT_SIZES: Record<string, string> = {
  "3xs": "0.45rem",
  "2xs": "0.625rem",
  xs: "0.75rem",
  sm: "0.875rem",
  md: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
  "6xl": "3.75rem",
  "7xl": "4.5rem",
  "8xl": "6rem",
  "9xl": "8rem",
};

function fontSizeProp(val: any): string | undefined {
  const resolved = resolveResponsive(val);
  if (resolved === undefined || resolved === null) return undefined;
  if (typeof resolved === "string" && FONT_SIZES[resolved] !== undefined)
    return FONT_SIZES[resolved];
  if (typeof resolved === "number") return `${resolved}px`;
  return String(resolved);
}

const FONT_WEIGHTS: Record<string, number> = {
  hairline: 100,
  thin: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

function fontWeightProp(val: any): string | undefined {
  const resolved = resolveResponsive(val);
  if (resolved === undefined || resolved === null) return undefined;
  if (typeof resolved === "string" && FONT_WEIGHTS[resolved] !== undefined)
    return String(FONT_WEIGHTS[resolved]);
  return String(resolved);
}

const SHADOWS: Record<string, string> = {
  xs: "0 0 0 1px rgba(0, 0, 0, 0.05)",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  outline: "0 0 0 3px rgba(66, 153, 225, 0.6)",
  inner: "inset 0 2px 4px 0 rgba(0,0,0,0.06)",
  none: "none",
};

function shadowProp(val: any): string | undefined {
  const resolved = resolveResponsive(val);
  if (resolved === undefined || resolved === null) return undefined;
  if (typeof resolved === "string" && SHADOWS[resolved] !== undefined)
    return SHADOWS[resolved];
  return String(resolved);
}

// Dot-path colour lookup against the project's real (extended) theme, e.g.
// "gray.500", "gray.light", "cbg.dark", falling back to the raw string
// (hex/rgba/named CSS colour) when no token matches.
function colorProp(val: any): string | undefined {
  const resolved = resolveResponsive(val);
  if (
    resolved === undefined ||
    resolved === null ||
    typeof resolved !== "string"
  )
    return resolved;
  const path = resolved.split(".");
  let node: any = (theme as any).colors;
  for (const key of path) {
    node = node?.[key];
    if (node === undefined) return resolved;
  }
  return typeof node === "string" ? node : resolved;
}

// Chakra allows responsive object ({base,md,...}) or array ([mobile, ...])
// prop values. Responsive values are generated as CSS media queries in
// buildResponsiveCssRules, so inline style resolution returns undefined.
function resolveResponsive(val: any): any {
  if (Array.isArray(val) || (val !== null && typeof val === "object")) {
    return undefined;
  }
  return val;
}

// ---------------------------------------------------------------------------
// Pseudo-state styling (_hover/_active/_focus/_disabled/_placeholder) — a
// scoped <style> tag + generated className, since inline `style` can't
// express pseudo-selectors.
// ---------------------------------------------------------------------------
const CSS_PROP_ALIAS: Record<string, string> = { bg: "background-color" };
const toKebabCase = (key: string) =>
  key.replace(/([A-Z])/g, "-$1").toLowerCase();

function pseudoStyleObjectToCss(obj?: Record<string, any>): string {
  if (!obj) return "";
  return Object.entries(obj)
    .map(([key, value]) => {
      const prop = CSS_PROP_ALIAS[key] ?? toKebabCase(key);
      const resolvedValue =
        key === "bg" || key === "color" || key === "borderColor"
          ? colorProp(value)
          : value;
      const val =
        typeof resolvedValue === "number"
          ? `${resolvedValue}px`
          : resolvedValue;
      return `${prop}: ${val};`;
    })
    .join(" ");
}

const BP_MEDIA_MIN = [
  "",
  "(min-width: 480px)",
  "(min-width: 768px)",
  "(min-width: 992px)",
  "(min-width: 1280px)",
  "(min-width: 1536px)",
];

const BP_NAME_MAP: Record<string, number> = {
  base: 0,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
  "2xl": 5,
};

const PROP_CSS_NAME_MAP: Record<string, string> = {
  bg: "background-color",
  background: "background-color",
  backgroundColor: "background-color",
  w: "width",
  maxW: "max-width",
  minW: "min-width",
  h: "height",
  maxH: "max-height",
  minH: "min-height",
  p: "padding",
  px: "padding-left",
  py: "padding-top",
  pt: "padding-top",
  pr: "padding-right",
  pb: "padding-bottom",
  pl: "padding-left",
  m: "margin",
  mx: "margin-left",
  my: "margin-top",
  mt: "margin-top",
  mr: "margin-right",
  mb: "margin-bottom",
  ml: "margin-left",
  flexDir: "flex-direction",
  direction: "flex-direction",
  flexDirection: "flex-direction",
  align: "align-items",
  alignItems: "align-items",
  justify: "justify-content",
  justifyContent: "justify-content",
  wrap: "flex-wrap",
  flexWrap: "flex-wrap",
  rounded: "border-radius",
  borderRadius: "border-radius",
  pos: "position",
};

function formatSinglePropVal(propKey: string, val: any): string | null {
  if (val === undefined || val === null) return null;
  const cssProp = PROP_CSS_NAME_MAP[propKey] ?? toKebabCase(propKey);
  let resolved = val;
  if (
    [
      "w",
      "width",
      "maxW",
      "maxWidth",
      "minW",
      "minWidth",
      "h",
      "height",
      "maxH",
      "maxHeight",
      "minH",
      "minHeight",
    ].includes(propKey)
  ) {
    resolved = sizeProp(val);
  } else if (
    [
      "p",
      "padding",
      "px",
      "py",
      "pt",
      "pr",
      "pb",
      "pl",
      "m",
      "margin",
      "mx",
      "my",
      "mt",
      "mr",
      "mb",
      "ml",
      "gap",
      "top",
      "right",
      "bottom",
      "left",
    ].includes(propKey)
  ) {
    resolved = spaceProp(val);
  } else if (
    ["bg", "background", "backgroundColor", "color", "borderColor"].includes(
      propKey,
    )
  ) {
    resolved = colorProp(val);
  } else if (["borderRadius", "rounded"].includes(propKey)) {
    resolved = radiusProp(val);
  } else if (propKey === "fontSize") {
    resolved = fontSizeProp(val);
  } else if (propKey === "fontWeight") {
    resolved = fontWeightProp(val);
  }
  if (resolved === undefined || resolved === null) return null;
  const finalVal = typeof resolved === "number" ? `${resolved}px` : resolved;

  if (propKey === "px") {
    return `padding-left: ${finalVal}; padding-right: ${finalVal};`;
  }
  if (propKey === "py") {
    return `padding-top: ${finalVal}; padding-bottom: ${finalVal};`;
  }
  if (propKey === "mx") {
    return `margin-left: ${finalVal}; margin-right: ${finalVal};`;
  }
  if (propKey === "my") {
    return `margin-top: ${finalVal}; margin-bottom: ${finalVal};`;
  }
  return `${cssProp}: ${finalVal};`;
}

function buildResponsiveCssRules(
  cn: string,
  props: Record<string, any>,
): string {
  const rulesByBp: Record<number, string[]> = {};

  for (const [key, value] of Object.entries(props)) {
    if (
      key.startsWith("_") ||
      key === "children" ||
      key === "style" ||
      key === "className" ||
      key === "sx"
    )
      continue;

    if (Array.isArray(value)) {
      value.forEach((v, idx) => {
        if (v !== undefined && idx < BP_MEDIA_MIN.length) {
          const rule = formatSinglePropVal(key, v);
          if (rule) {
            rulesByBp[idx] = rulesByBp[idx] || [];
            rulesByBp[idx].push(rule);
          }
        }
      });
    } else if (value !== null && typeof value === "object") {
      for (const [bpKey, v] of Object.entries(value)) {
        const idx = BP_NAME_MAP[bpKey];
        if (idx !== undefined && v !== undefined) {
          const rule = formatSinglePropVal(key, v);
          if (rule) {
            rulesByBp[idx] = rulesByBp[idx] || [];
            rulesByBp[idx].push(rule);
          }
        }
      }
    }
  }

  const cssBlocks: string[] = [];
  for (let idx = 0; idx < BP_MEDIA_MIN.length; idx++) {
    if (rulesByBp[idx] && rulesByBp[idx].length > 0) {
      const decls = rulesByBp[idx].join(" ");
      if (idx === 0) {
        cssBlocks.push(`.${cn} { ${decls} }`);
      } else {
        cssBlocks.push(`@media ${BP_MEDIA_MIN[idx]} { .${cn} { ${decls} } }`);
      }
    }
  }

  return cssBlocks.join("\n");
}

function usePseudoStyle(props: Record<string, any>) {
  const { _hover, _active, _focus, _disabled, _placeholder } = props;
  const reactId = useId();

  const hasPseudo = !!(
    _hover ||
    _active ||
    _focus ||
    _disabled ||
    _placeholder
  );
  const hasResponsive = Object.values(props).some(
    (val) =>
      Array.isArray(val) ||
      (val !== null &&
        typeof val === "object" &&
        ("base" in val || "sm" in val || "md" in val || "lg" in val)),
  );

  const needsCss = hasPseudo || hasResponsive;

  if (!needsCss)
    return {
      className: undefined as string | undefined,
      styleEl: null as React.ReactNode,
    };

  const cn = `primitive-${reactId.replace(/:/g, "")}`;
  const pseudoRules = [
    _hover &&
      `.${cn}:hover:not(:disabled) { ${pseudoStyleObjectToCss(_hover)} }`,
    _active &&
      `.${cn}:active:not(:disabled) { ${pseudoStyleObjectToCss(_active)} }`,
    _focus && `.${cn}:focus { ${pseudoStyleObjectToCss(_focus)} }`,
    _disabled && `.${cn}:disabled { ${pseudoStyleObjectToCss(_disabled)} }`,
    _placeholder &&
      `.${cn}::placeholder { ${pseudoStyleObjectToCss(_placeholder)} }`,
  ]
    .filter(Boolean)
    .join("\n");

  const responsiveRules = hasResponsive
    ? buildResponsiveCssRules(cn, props)
    : "";
  const allRules = [pseudoRules, responsiveRules].filter(Boolean).join("\n");

  return {
    className: cn,
    styleEl: <style key={`style-${cn}`}>{allRules}</style>,
  };
}

// ---------------------------------------------------------------------------
// Shared style props
// ---------------------------------------------------------------------------
export interface StyleProps extends PseudoProps {
  w?: any;
  width?: any;
  maxW?: any;
  maxWidth?: any;
  minW?: any;
  minWidth?: any;
  h?: any;
  height?: any;
  maxH?: any;
  maxHeight?: any;
  minH?: any;
  minHeight?: any;
  boxSize?: any;
  p?: any;
  padding?: any;
  px?: any;
  py?: any;
  pt?: any;
  pr?: any;
  pb?: any;
  pl?: any;
  paddingTop?: any;
  paddingRight?: any;
  paddingBottom?: any;
  paddingLeft?: any;
  m?: any;
  margin?: any;
  mx?: any;
  my?: any;
  mt?: any;
  mr?: any;
  mb?: any;
  ml?: any;
  marginTop?: any;
  marginRight?: any;
  marginBottom?: any;
  marginLeft?: any;
  gap?: any;
  bg?: string;
  background?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundRepeat?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundBlendMode?: string;
  color?: string;
  borderRadius?: any;
  rounded?: any;
  border?: string;
  borderColor?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderX?: string;
  borderY?: string;
  borderWidth?: any;
  position?: any;
  pos?: any;
  top?: any;
  right?: any;
  bottom?: any;
  left?: any;
  zIndex?: number | string;
  cursor?: string;
  overflow?: CSSProperties["overflow"];
  overflowY?: CSSProperties["overflowY"];
  overflowX?: CSSProperties["overflowX"];
  display?: any;
  opacity?: any;
  boxShadow?: string;
  shadow?: string;
  transform?: string;
  transition?: string;
  animation?: string;
  outline?: string;
  fontSize?: any;
  fontWeight?: any;
  textAlign?: CSSProperties["textAlign"];
  align?: any;
  textTransform?: CSSProperties["textTransform"];
  whiteSpace?: CSSProperties["whiteSpace"];
  textOverflow?: CSSProperties["textOverflow"];
  textDecoration?: string;
  pointerEvents?: CSSProperties["pointerEvents"];
  lineHeight?: any;
  verticalAlign?: CSSProperties["verticalAlign"];
  objectFit?: CSSProperties["objectFit"];
  float?: CSSProperties["float"];
  flex?: any;
  flexDirection?: any;
  direction?: any;
  flexDir?: any;
  alignItems?: any;
  justifyContent?: any;
  justify?: any;
  flexWrap?: any;
  wrap?: any;
  alignContent?: any;
  alignSelf?: any;
  flexShrink?: number;
  flexGrow?: number;
  flexBasis?: any;
  boxSizing?: CSSProperties["boxSizing"];
  colSpan?: number;
  sx?: StyleProps;
}

function buildStyle(props: StyleProps): CSSProperties {
  const {
    w,
    width,
    maxW,
    maxWidth,
    minW,
    minWidth,
    h,
    height,
    maxH,
    maxHeight,
    minH,
    minHeight,
    boxSize,
    p,
    padding,
    px,
    py,
    pt,
    pr,
    pb,
    pl,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    m,
    margin,
    mx,
    my,
    mt,
    mr,
    mb,
    ml,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    gap,
    bg,
    background,
    backgroundColor,
    backgroundImage,
    backgroundRepeat,
    backgroundSize,
    backgroundPosition,
    backgroundBlendMode,
    color,
    borderRadius,
    rounded,
    border,
    borderColor,
    borderTop,
    borderRight,
    borderBottom,
    borderLeft,
    borderX,
    borderY,
    borderWidth,
    position,
    pos,
    top,
    right,
    bottom,
    left,
    zIndex,
    cursor,
    overflow,
    overflowY,
    overflowX,
    display,
    opacity,
    boxShadow,
    shadow,
    transform,
    transition,
    animation,
    outline,
    fontSize,
    fontWeight,
    textAlign,
    align,
    textTransform,
    whiteSpace,
    textOverflow,
    textDecoration,
    pointerEvents,
    lineHeight,
    verticalAlign,
    objectFit,
    float,
    flex,
    flexDirection,
    direction,
    flexDir,
    alignItems,
    justifyContent,
    justify,
    flexWrap,
    wrap,
    alignContent,
    alignSelf,
    flexShrink,
    flexGrow,
    flexBasis,
    boxSizing,
    sx,
  } = props;

  const size = sizeProp(boxSize);

  const style: CSSProperties = {
    width: size ?? sizeProp(w ?? width),
    height: size ?? sizeProp(h ?? height),
    minWidth: sizeProp(minW ?? minWidth),
    maxWidth: sizeProp(maxW ?? maxWidth),
    minHeight: sizeProp(minH ?? minHeight),
    maxHeight: sizeProp(maxH ?? maxHeight),
    padding: spaceProp(p ?? padding),
    paddingLeft: spaceProp(pl ?? px ?? paddingLeft),
    paddingRight: spaceProp(pr ?? px ?? paddingRight),
    paddingTop: spaceProp(pt ?? py ?? paddingTop),
    paddingBottom: spaceProp(pb ?? py ?? paddingBottom),
    margin: spaceProp(m ?? margin),
    marginLeft: spaceProp(ml ?? mx ?? marginLeft),
    marginRight: spaceProp(mr ?? mx ?? marginRight),
    marginTop: spaceProp(mt ?? my ?? marginTop),
    marginBottom: spaceProp(mb ?? my ?? marginBottom),
    gap: spaceProp(gap),
    backgroundColor: colorProp(bg ?? background ?? backgroundColor),
    backgroundImage,
    backgroundRepeat,
    backgroundSize,
    backgroundPosition,
    backgroundBlendMode,
    color: colorProp(color),
    borderRadius: radiusProp(borderRadius ?? rounded),
    border,
    borderColor: colorProp(borderColor),
    borderTop,
    borderRight: borderRight ?? borderX,
    borderBottom,
    borderLeft: borderLeft ?? borderX,
    ...(borderY
      ? {
          borderTop: borderTop ?? borderY,
          borderBottom: borderBottom ?? borderY,
        }
      : {}),
    borderWidth: spaceProp(borderWidth),
    position: position ?? pos,
    top: spaceProp(top),
    right: spaceProp(right),
    bottom: spaceProp(bottom),
    left: spaceProp(left),
    zIndex: zIndex !== undefined ? Number(zIndex) : undefined,
    cursor,
    overflow,
    overflowY,
    overflowX,
    display: resolveResponsive(display),
    opacity,
    boxShadow: shadowProp(boxShadow ?? shadow),
    transform,
    transition,
    animation,
    outline,
    fontSize: fontSizeProp(fontSize),
    fontWeight: fontWeightProp(fontWeight),
    textAlign,
    textTransform,
    whiteSpace,
    textOverflow,
    textDecoration,
    pointerEvents,
    lineHeight,
    verticalAlign,
    objectFit,
    float,
    flex: flex !== undefined ? String(flex) : undefined,
    flexDirection: resolveResponsive(flexDirection ?? direction ?? flexDir),
    // Chakra's style-props system applies `align` as alignItems on every
    // styled component uniformly (not just Flex/Stack) — matched here for
    // fidelity even though it's a no-op on non-flex elements.
    alignItems: resolveResponsive(alignItems ?? align),
    justifyContent: resolveResponsive(justifyContent ?? justify),
    flexWrap: resolveResponsive(flexWrap ?? wrap),
    alignContent,
    alignSelf,
    flexShrink,
    flexGrow,
    flexBasis,
    boxSizing,
    ...(sx ? buildStyle(sx) : {}),
  };

  // Omit keys the caller never actually specified (value undefined) instead
  // of returning them as explicit `undefined` entries — otherwise spreading
  // this result after a component's own hardcoded default (e.g. Button's
  // `border: "none"`) silently wipes that default out even when nobody
  // asked for a different value.
  for (const key of Object.keys(style)) {
    if ((style as any)[key] === undefined) delete (style as any)[key];
  }
  return style;
}

const STYLE_KEYS = new Set([
  "w",
  "width",
  "maxW",
  "maxWidth",
  "minW",
  "minWidth",
  "h",
  "height",
  "maxH",
  "maxHeight",
  "minH",
  "minHeight",
  "boxSize",
  "p",
  "padding",
  "px",
  "py",
  "pt",
  "pr",
  "pb",
  "pl",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "m",
  "margin",
  "mx",
  "my",
  "mt",
  "mr",
  "mb",
  "ml",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "gap",
  "bg",
  "background",
  "backgroundColor",
  "backgroundImage",
  "backgroundRepeat",
  "backgroundSize",
  "backgroundPosition",
  "backgroundBlendMode",
  "color",
  "borderRadius",
  "rounded",
  "border",
  "borderColor",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "borderX",
  "borderY",
  "borderWidth",
  "position",
  "pos",
  "top",
  "right",
  "bottom",
  "left",
  "zIndex",
  "cursor",
  "overflow",
  "overflowY",
  "overflowX",
  "display",
  "opacity",
  "boxShadow",
  "shadow",
  "transform",
  "transition",
  "animation",
  "outline",
  "fontSize",
  "fontWeight",
  "textAlign",
  "align",
  "textTransform",
  "whiteSpace",
  "textOverflow",
  "textDecoration",
  "pointerEvents",
  "lineHeight",
  "verticalAlign",
  "objectFit",
  "float",
  "flex",
  "flexDirection",
  "direction",
  "flexDir",
  "alignItems",
  "justifyContent",
  "justify",
  "flexWrap",
  "wrap",
  "alignContent",
  "alignSelf",
  "flexShrink",
  "flexGrow",
  "flexBasis",
  "boxSizing",
  "colSpan",
  "sx",
  "_hover",
  "_active",
  "_focus",
  "_disabled",
  "_placeholder",
]);

function omitStyleProps<T extends Record<string, any>>(
  props: T,
): Record<string, any> {
  const rest: Record<string, any> = {};
  for (const key of Object.keys(props)) {
    if (!STYLE_KEYS.has(key)) rest[key] = props[key];
  }
  return rest;
}

// ---------------------------------------------------------------------------
// Box
// ---------------------------------------------------------------------------
export interface BoxProps
  extends
    StyleProps,
    Omit<HTMLAttributes<HTMLDivElement>, "color" | "translate"> {
  as?: any;
  // Allows `as="button" type="submit"` etc. — `type` isn't part of
  // HTMLAttributes<HTMLDivElement> since real divs don't have it.
  type?: string;
}

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

export const Box = forwardRef<HTMLDivElement, BoxProps>(
  (props, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      as: Comp = "div",
      style,
      className,
      children,
      ...styleAndRest
    } = props;
    const computedStyle = { ...buildStyle(styleAndRest), ...style };
    const { className: pseudoClassName, styleEl } =
      usePseudoStyle(styleAndRest);
    const rest = omitStyleProps(styleAndRest);
    const finalClassName =
      [pseudoClassName, className].filter(Boolean).join(" ") || undefined;

    const isVoid =
      typeof Comp === "string" && VOID_ELEMENTS.has(Comp.toLowerCase());

    if (isVoid) {
      return (
        <>
          {styleEl}
          <Comp
            ref={ref}
            className={finalClassName}
            style={computedStyle}
            {...rest}
          />
        </>
      );
    }

    return (
      <Comp
        ref={ref}
        className={finalClassName}
        style={computedStyle}
        {...rest}
      >
        {styleEl}
        {children}
      </Comp>
    );
  },
);
Box.displayName = "Box";

// ---------------------------------------------------------------------------
// Flex
// ---------------------------------------------------------------------------
export type FlexProps = BoxProps;

export const Flex = forwardRef<HTMLDivElement, FlexProps>(
  (props, ref: ForwardedRef<HTMLDivElement>) => (
    <Box ref={ref} display="flex" {...props} />
  ),
);
Flex.displayName = "Flex";

// ---------------------------------------------------------------------------
// Stack / HStack / VStack — ported 1:1 from @chakra-ui/layout's stack.tsx:
// Stack defaults `spacing` to "0.5rem" (8px) with no forced alignItems;
// HStack/VStack default `align` to "center" (still overridable by the
// caller) but always force their own `direction` (not overridable).
// ---------------------------------------------------------------------------
export interface StackProps extends BoxProps {
  spacing?: any;
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    { spacing, gap, direction = "column", ...rest },
    ref: ForwardedRef<HTMLDivElement>,
  ) => (
    <Flex ref={ref} direction={direction} gap={gap ?? spacing ?? 2} {...rest} />
  ),
);
Stack.displayName = "Stack";

export const HStack = forwardRef<HTMLDivElement, StackProps>(
  ({ align, alignItems, ...rest }, ref: ForwardedRef<HTMLDivElement>) => (
    <Stack
      ref={ref}
      align={align ?? alignItems ?? "center"}
      {...rest}
      direction="row"
    />
  ),
);
HStack.displayName = "HStack";

export const VStack = forwardRef<HTMLDivElement, StackProps>(
  ({ align, alignItems, ...rest }, ref: ForwardedRef<HTMLDivElement>) => (
    <Stack
      ref={ref}
      align={align ?? alignItems ?? "center"}
      {...rest}
      direction="column"
    />
  ),
);
VStack.displayName = "VStack";

// ---------------------------------------------------------------------------
// Text / Heading — Heading sizes copied from Chakra's heading.mjs (fontSize
// only; the responsive [base, null, lg] array collapses to its base value).
// ---------------------------------------------------------------------------
export interface TextProps extends BoxProps {
  noOfLines?: number;
  as?: any;
  variant?: string;
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  (
    { noOfLines, style, as = "p", variant: _variant, ...rest },
    ref: ForwardedRef<HTMLParagraphElement>,
  ) => {
    const textStyle: CSSProperties = {
      ...(noOfLines
        ? {
            display: "-webkit-box",
            WebkitLineClamp: noOfLines,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }
        : {}),
      ...style,
    };
    return <Box ref={ref as any} as={as} style={textStyle} {...rest} />;
  },
);
Text.displayName = "Text";

const HEADING_SIZE_TO_FONT_SIZE: Record<string, string> = {
  xs: FONT_SIZES.sm,
  sm: FONT_SIZES.md,
  md: FONT_SIZES.xl,
  lg: FONT_SIZES["2xl"],
  xl: FONT_SIZES["3xl"],
  "2xl": FONT_SIZES["4xl"],
  "3xl": FONT_SIZES["5xl"],
  "4xl": FONT_SIZES["6xl"],
};

export interface HeadingProps extends TextProps {
  size?: string;
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    { size = "xl", fontSize, fontWeight = "bold", as = "h2", ...rest },
    ref: ForwardedRef<HTMLHeadingElement>,
  ) => (
    <Text
      ref={ref as any}
      as={as}
      fontSize={fontSize ?? HEADING_SIZE_TO_FONT_SIZE[size] ?? size}
      fontWeight={fontWeight}
      {...rest}
    />
  ),
);
Heading.displayName = "Heading";

// ---------------------------------------------------------------------------
// Badge — base style copied from Chakra's badge.mjs (subtle/gray default).
// ---------------------------------------------------------------------------
export interface BadgeProps extends BoxProps {
  colorScheme?: string;
  variant?: "solid" | "subtle" | "outline";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { colorScheme = "gray", variant = "subtle", style, ...rest },
    ref: ForwardedRef<HTMLSpanElement>,
  ) => {
    const variantStyle: CSSProperties =
      variant === "solid"
        ? { backgroundColor: colorProp(`${colorScheme}.500`), color: "#fff" }
        : variant === "outline"
          ? {
              color: colorProp(`${colorScheme}.500`),
              boxShadow: `inset 0 0 0px 1px ${colorProp(`${colorScheme}.500`)}`,
            }
          : {
              backgroundColor: colorProp(`${colorScheme}.100`),
              color: colorProp(`${colorScheme}.800`),
            };
    return (
      <Box
        ref={ref as any}
        as="span"
        display="inline-block"
        px={1}
        textTransform="uppercase"
        fontSize="xs"
        borderRadius="sm"
        fontWeight="bold"
        style={{ ...variantStyle, ...style }}
        {...rest}
      />
    );
  },
);
Badge.displayName = "Badge";

// ---------------------------------------------------------------------------
// Container
// ---------------------------------------------------------------------------
export interface ContainerProps extends BoxProps {
  centerContent?: boolean;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    { maxW = "60ch", centerContent, style, ...rest },
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const containerStyle: CSSProperties = {
      width: "100%",
      marginLeft: "auto",
      marginRight: "auto",
      paddingLeft: "16px",
      paddingRight: "16px",
      ...(centerContent
        ? { display: "flex", flexDirection: "column", alignItems: "center" }
        : {}),
      ...style,
    };
    return <Box ref={ref} maxW={maxW} style={containerStyle} {...rest} />;
  },
);
Container.displayName = "Container";

// ---------------------------------------------------------------------------
// Card & CardBody — defaults copied from Chakra's card.mjs (variant
// "elevated", size "md": radii.md, space.5 padding, shadows.base).
// ---------------------------------------------------------------------------
export const Card = forwardRef<HTMLDivElement, BoxProps>(
  ({ style, ...rest }, ref: ForwardedRef<HTMLDivElement>) => (
    <Box
      ref={ref}
      style={{
        backgroundColor: "var(--bg-card)",
        boxShadow: SHADOWS.base,
        borderRadius: RADII.md,
        ...style,
      }}
      {...rest}
    />
  ),
);
Card.displayName = "Card";

export const CardBody = forwardRef<HTMLDivElement, BoxProps>(
  ({ p, style, ...rest }, ref: ForwardedRef<HTMLDivElement>) => (
    <Box ref={ref} p={p ?? 5} style={style} {...rest} />
  ),
);
CardBody.displayName = "CardBody";

// ---------------------------------------------------------------------------
// Divider
// ---------------------------------------------------------------------------
export const Divider = forwardRef<HTMLHRElement, BoxProps>(
  (
    { style, width, w, borderWidth, ...rest },
    ref: ForwardedRef<HTMLHRElement>,
  ) => (
    <hr
      ref={ref}
      style={{
        border: "none",
        borderTop: `${spaceProp(borderWidth) || "1px"} solid var(--divider-color)`,
        margin: "8px 0",
        width: sizeProp(w ?? width),
        ...style,
      }}
      {...omitStyleProps(rest)}
    />
  ),
);
Divider.displayName = "Divider";

// ---------------------------------------------------------------------------
// Button — sizes copied from Chakra's button.mjs.
// ---------------------------------------------------------------------------
const BUTTON_SIZES: Record<
  string,
  { h: string; minW: string; fontSize: string; px: string }
> = {
  lg: { h: "48px", minW: "48px", fontSize: FONT_SIZES.lg, px: "24px" },
  md: { h: "40px", minW: "40px", fontSize: FONT_SIZES.md, px: "16px" },
  sm: { h: "32px", minW: "32px", fontSize: FONT_SIZES.sm, px: "12px" },
  xs: { h: "24px", minW: "24px", fontSize: FONT_SIZES.xs, px: "8px" },
};

export interface ButtonProps
  extends
    StyleProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "translate"> {
  variant?: "solid" | "outline" | "ghost" | "link" | "unstyled" | "";
  colorScheme?: string;
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref: ForwardedRef<HTMLButtonElement>) => {
    // A caller that never asks for Chakra-style theming (no `variant`/
    // `colorScheme`) is styling this Button entirely through `className` —
    // don't let a hardcoded default color/size/radius win over that CSS just
    // because it happens to be computed later in this function.
    const hasExplicitTheming =
      props.variant !== undefined || props.colorScheme !== undefined;
    const {
      variant = "solid",
      colorScheme = "gray",
      size = "md",
      isLoading,
      loadingText,
      style,
      className,
      children,
      disabled,
      ...styleAndRest
    } = props;
    const { className: pseudoClassName, styleEl } =
      usePseudoStyle(styleAndRest);
    const rest = omitStyleProps(styleAndRest);
    delete (rest as any).variant;
    delete (rest as any).colorScheme;
    delete (rest as any).size;
    delete (rest as any).isLoading;
    delete (rest as any).loadingText;

    const sizeStyle = BUTTON_SIZES[size] ?? BUTTON_SIZES.md;
    const variantStyle: CSSProperties = !hasExplicitTheming
      ? {}
      : variant === "outline"
        ? {
            backgroundColor: "transparent",
            border: `1px solid ${colorProp(`${colorScheme}.500`) || "white"}`,
            color: colorProp(`${colorScheme}.500`),
          }
        : variant === "ghost"
          ? { backgroundColor: "transparent" }
          : variant === "link"
            ? {
                backgroundColor: "transparent",
                padding: 0,
                height: "auto",
                textDecoration: "underline",
              }
            : variant === "unstyled"
              ? {
                  backgroundColor: "transparent",
                  padding: 0,
                  height: "auto",
                  borderRadius: 0,
                  fontWeight: "inherit",
                }
              : {
                  backgroundColor:
                    colorProp(`${colorScheme}.500`) || "var(--bg-hover)",
                  color: "#fff",
                };

    const buttonStyle: CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      verticalAlign: "middle",
      lineHeight: "1.2",
      fontWeight: FONT_WEIGHTS.semibold as any,
      cursor: disabled || isLoading ? "not-allowed" : "pointer",
      opacity: disabled || isLoading ? 0.4 : 1,
      transition: "all 0.2s",
      border: "none",
      outline: "none",
      ...(hasExplicitTheming ? { borderRadius: RADII.md } : {}),
      ...(hasExplicitTheming && variant !== "link" && variant !== "unstyled"
        ? {
            height: sizeStyle.h,
            minWidth: sizeStyle.minW,
            fontSize: sizeStyle.fontSize,
            paddingLeft: sizeStyle.px,
            paddingRight: sizeStyle.px,
          }
        : {}),
      ...variantStyle,
      ...buildStyle(styleAndRest),
      ...style,
    };

    return (
      <button
        ref={ref}
        type={rest.type ?? "button"}
        className={
          [pseudoClassName, className].filter(Boolean).join(" ") || undefined
        }
        style={buttonStyle}
        disabled={disabled || isLoading}
        {...rest}
      >
        {styleEl}
        {isLoading ? (
          <>
            <Spinner size="sm" />
            {loadingText}
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);
Button.displayName = "Button";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
export interface InputProps
  extends
    StyleProps,
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "color" | "translate" | "height" | "width" | "size"
    > {
  variant?: string;
  size?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (props, ref: ForwardedRef<HTMLInputElement>) => {
    const {
      style,
      className,
      variant: _variant,
      size: _size,
      ...styleAndRest
    } = props;
    const { className: pseudoClassName, styleEl } =
      usePseudoStyle(styleAndRest);
    const rest = omitStyleProps(styleAndRest);

    const inputStyle: CSSProperties = {
      width: "100%",
      height: "40px",
      padding: "8px 16px",
      borderRadius: RADII.md,
      border: "1px solid var(--border-color)",
      backgroundColor: "var(--bg-input)",
      color: "var(--text-primary)",
      fontSize: FONT_SIZES.md,
      outline: "none",
      ...buildStyle(styleAndRest),
      ...style,
    };

    return (
      <>
        {styleEl}
        <input
          ref={ref}
          className={
            [pseudoClassName, className].filter(Boolean).join(" ") || undefined
          }
          style={inputStyle}
          {...rest}
        />
      </>
    );
  },
);
Input.displayName = "Input";

// ---------------------------------------------------------------------------
// Spinner (used by Button's isLoading state)
// ---------------------------------------------------------------------------
export const Spinner = ({
  size = "md",
  color,
}: {
  size?: "sm" | "md" | "lg";
  color?: string;
}) => {
  const dim = size === "sm" ? "16px" : size === "lg" ? "32px" : "24px";
  return (
    <div
      style={{
        width: dim,
        height: dim,
        border: `2px solid ${color || "white"}`,
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "spin 0.6s linear infinite",
        display: "inline-block",
      }}
    >
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Avatar — size scale copied from Chakra's avatar.mjs (getSize(n) against
// the space/sizes table): 2xs=16px, xs=24px, sm=32px, md=48px, lg=64px,
// xl=96px, 2xl=128px. fontSize = size / 2.5 (Chakra's own formula).
// ---------------------------------------------------------------------------
const AVATAR_SIZE_PX: Record<string, number> = {
  "2xs": 16,
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
  "2xl": 128,
};

export interface AvatarProps extends BoxProps {
  name?: string;
  src?: string;
  size?: any;
}

function getInitials(name?: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return (
    (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")
  ).toUpperCase();
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    { name, src, size = "md", style, className, ...rest },
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const customDim = rest.w || rest.width || rest.h || rest.height;
    const resolvedSize = resolveResponsive(size);
    const dim = customDim
      ? sizeProp(customDim)
      : AVATAR_SIZE_PX[resolvedSize]
      ? `${AVATAR_SIZE_PX[resolvedSize]}px`
      : (sizeProp(resolvedSize) ?? "48px");
    const [errored, setErrored] = useState(false);
    return (
      <Box
        ref={ref}
        className={className}
        position="relative"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        verticalAlign="top"
        w={dim}
        h={dim}
        borderRadius="50%"
        overflow="hidden"
        bg="var(--bg-hover)"
        color="var(--text-secondary)"
        style={{
          flexShrink: 0,
          fontWeight: 600,
          fontSize: `calc(${dim} / 2.5)`,
          ...style,
        }}
        {...rest}
      >
        {src && !errored ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name || "avatar"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={() => setErrored(true)}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </Box>
    );
  },
);
Avatar.displayName = "Avatar";

export const AvatarBadge = forwardRef<HTMLDivElement, BoxProps>(
  (
    { boxSize = "14px", bg = "#38a169", style, ...rest }: any,
    ref: ForwardedRef<HTMLDivElement>,
  ) => (
    <Box
      ref={ref}
      position="absolute"
      bottom="0"
      right="0"
      w={boxSize}
      h={boxSize}
      borderRadius="50%"
      bg={bg}
      style={{ border: "0.2em solid var(--bg-card)", ...style }}
      {...rest}
    />
  ),
);
AvatarBadge.displayName = "AvatarBadge";

// ---------------------------------------------------------------------------
// Link
// ---------------------------------------------------------------------------
export interface LinkProps
  extends
    StyleProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "color"> {
  as?: any;
  href?: string;
  isExternal?: boolean;
  color?: string;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    { href = "#", isExternal, children, style, color, as, ...styleAndRest },
    ref: ForwardedRef<HTMLAnchorElement>,
  ) => {
    const rest = omitStyleProps(styleAndRest);
    const linkStyle: CSSProperties = {
      color: colorProp(color) || "inherit",
      textDecoration: "none",
      ...buildStyle(styleAndRest),
      ...style,
    };

    if (isExternal || href.startsWith("http")) {
      return (
        <a
          ref={ref}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
          {...rest}
        >
          {children}
        </a>
      );
    }

    return (
      <NextLink ref={ref} href={href} style={linkStyle} {...rest}>
        {children}
      </NextLink>
    );
  },
);
Link.displayName = "Link";

export const GridItem = Box;

// ---------------------------------------------------------------------------
// Image — Chakra's <Image> accepts the same style-prop shorthand as Box on
// top of native <img> attributes.
// ---------------------------------------------------------------------------
export interface ImageProps
  extends
    StyleProps,
    Omit<
      React.ImgHTMLAttributes<HTMLImageElement>,
      "color" | "translate" | "height" | "width"
    > {
  objectFit?: CSSProperties["objectFit"];
  fallbackSrc?: string;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  (props, ref: ForwardedRef<HTMLImageElement>) => {
    const {
      style,
      className,
      objectFit,
      fallbackSrc,
      src,
      onError,
      ...styleAndRest
    } = props;
    const [errored, setErrored] = useState(false);
    const rest = omitStyleProps(styleAndRest);
    const imgStyle: CSSProperties = {
      objectFit,
      ...buildStyle(styleAndRest),
      ...style,
    };
    return (
      <img
        ref={ref}
        className={className}
        style={imgStyle}
        src={errored && fallbackSrc ? fallbackSrc : src}
        onError={(e) => {
          setErrored(true);
          onError?.(e);
        }}
        {...rest}
      />
    );
  },
);
Image.displayName = "Image";

// ---------------------------------------------------------------------------
// InputGroup / InputLeftElement / InputRightElement
// ---------------------------------------------------------------------------
export const InputGroup = forwardRef<
  HTMLDivElement,
  BoxProps & { size?: string }
>(({ children, size: _size, ...rest }, ref) => (
  <Box
    ref={ref}
    position="relative"
    display="flex"
    width="100%"
    alignItems="center"
    {...rest}
  >
    {children}
  </Box>
));
InputGroup.displayName = "InputGroup";

export const InputLeftElement = forwardRef<HTMLDivElement, BoxProps>(
  ({ children, ...rest }, ref) => (
    <Box
      ref={ref}
      position="absolute"
      left="0"
      display="flex"
      alignItems="center"
      px={2}
      zIndex={1}
      {...rest}
    >
      {children}
    </Box>
  ),
);
InputLeftElement.displayName = "InputLeftElement";

export const InputRightElement = forwardRef<HTMLDivElement, BoxProps>(
  ({ children, ...rest }, ref) => (
    <Box
      ref={ref}
      position="absolute"
      right="0"
      display="flex"
      alignItems="center"
      px={2}
      zIndex={1}
      {...rest}
    >
      {children}
    </Box>
  ),
);
InputRightElement.displayName = "InputRightElement";

// Chakra's default breakpoints (theme.breakpoints), in px.
const BREAKPOINTS_PX: Record<string, number> = {
  base: 0,
  sm: 480,
  md: 768,
  lg: 992,
  xl: 1280,
  "2xl": 1536,
};
const BREAKPOINT_ORDER = ["base", "sm", "md", "lg", "xl", "2xl"];

function getCurrentBreakpoint(): string {
  if (typeof window === "undefined") return "base";
  const w = window.innerWidth;
  let current = "base";
  for (const key of BREAKPOINT_ORDER) {
    if (w >= BREAKPOINTS_PX[key]) current = key;
  }
  return current;
}

// A real reactive replacement for Chakra's useBreakpointValue — tracks
// window width via a resize listener and re-renders on breakpoint changes.
// (The static `resolveResponsive` used elsewhere for inline style props
// intentionally stays SSR-only/mobile-first; this hook is specifically for
// JS-level branching like `isMobile = useBreakpointValue({base:true,md:false})`.)
export function useBreakpointValue(values: any): any {
  // `base` on the server/first paint avoids a hydration mismatch; the real
  // breakpoint is measured and applied right after mount.
  const [breakpoint, setBreakpoint] = useState("base");

  useEffect(() => {
    const update = () => setBreakpoint(getCurrentBreakpoint());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (Array.isArray(values)) {
    const idx = BREAKPOINT_ORDER.indexOf(breakpoint);
    for (let i = idx; i >= 0; i--) {
      if (values[i] !== undefined && values[i] !== null) return values[i];
    }
    return values[0];
  }
  if (values !== null && typeof values === "object") {
    // Mobile-first cascade: value defined at a breakpoint applies to that
    // breakpoint and all larger ones until a bigger breakpoint overrides it.
    const idx = BREAKPOINT_ORDER.indexOf(breakpoint);
    for (let i = idx; i >= 0; i--) {
      const key = BREAKPOINT_ORDER[i];
      if (values[key] !== undefined) return values[key];
    }
    return values.base ?? Object.values(values)[0];
  }
  return values;
}

export type PlacementWithLogical = string;

// ---------------------------------------------------------------------------
// Icon — ported from @chakra-ui/icon: baseStyle is w/h "1em", inline-block,
// lineHeight "1em", flexShrink 0, color white. `as` is the SVG
// component (react-icons).
// ---------------------------------------------------------------------------
export interface IconProps extends StyleProps {
  as?: any;
  onClick?: React.MouseEventHandler;
  [key: string]: any;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  (props, ref: ForwardedRef<SVGSVGElement>) => {
    const { as: Comp, style, color = "white", ...styleAndRest } = props;
    const rest = omitStyleProps(styleAndRest);
    const iconStyle: CSSProperties = {
      width: "1em",
      height: "1em",
      display: "inline-block",
      lineHeight: "1em",
      flexShrink: 0,
      color: colorProp(color),
      ...buildStyle(styleAndRest),
      ...style,
    };
    const Component = Comp || "svg";
    return <Component ref={ref} style={iconStyle} {...rest} />;
  },
);
Icon.displayName = "Icon";

// ---------------------------------------------------------------------------
// Center
// ---------------------------------------------------------------------------
export const Center = forwardRef<HTMLDivElement, BoxProps>(
  (props, ref: ForwardedRef<HTMLDivElement>) => (
    <Box
      ref={ref}
      display="flex"
      alignItems="center"
      justifyContent="center"
      {...props}
    />
  ),
);
Center.displayName = "Center";

// ---------------------------------------------------------------------------
// WrapItem — simple flex-item wrapper (Chakra's Wrap/WrapItem uses negative
// margins on the parent + margin on each item; only WrapItem is used here).
// ---------------------------------------------------------------------------
export const WrapItem = forwardRef<HTMLDivElement, BoxProps>(
  (props, ref: ForwardedRef<HTMLDivElement>) => (
    <Box ref={ref} display="flex" alignItems="flex-start" {...props} />
  ),
);
WrapItem.displayName = "WrapItem";

// ---------------------------------------------------------------------------
// ButtonGroup — ported from @chakra-ui/react's button-group.tsx: `isAttached`
// strips border-radius between adjacent children via real sibling
// selectors (can't be done with inline style, hence the injected <style>).
// ---------------------------------------------------------------------------
let buttonGroupCounter = 0;

export interface ButtonGroupProps extends BoxProps {
  isAttached?: boolean;
  spacing?: any;
  orientation?: "horizontal" | "vertical";
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      isAttached,
      spacing,
      orientation = "horizontal",
      style,
      children,
      ...rest
    },
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const classNameRef = useRef<string>();
    if (!classNameRef.current)
      classNameRef.current = `btngroup-${(buttonGroupCounter++).toString(36)}`;
    const cn = classNameRef.current;
    const isVertical = orientation === "vertical";

    const rules = isAttached
      ? isVertical
        ? `.${cn} > *:first-of-type:not(:last-of-type) { border-bottom-left-radius: 0; border-bottom-right-radius: 0; }
           .${cn} > *:not(:first-of-type):not(:last-of-type) { border-radius: 0; }
           .${cn} > *:not(:first-of-type):last-of-type { border-top-left-radius: 0; border-top-right-radius: 0; }`
        : `.${cn} > *:first-of-type:not(:last-of-type) { border-top-right-radius: 0; border-bottom-right-radius: 0; }
           .${cn} > *:not(:first-of-type):not(:last-of-type) { border-radius: 0; }
           .${cn} > *:not(:first-of-type):last-of-type { border-top-left-radius: 0; border-bottom-left-radius: 0; }`
      : isVertical
        ? `.${cn} > * ~ * { margin-top: ${spaceProp(spacing) || "8px"}; }`
        : `.${cn} > * ~ * { margin-left: ${spaceProp(spacing) || "8px"}; }`;

    return (
      <>
        <style>{rules}</style>
        <Box
          ref={ref}
          className={cn}
          role="group"
          display="inline-flex"
          flexDirection={isVertical ? "column" : "row"}
          style={style}
          {...rest}
        >
          {children}
        </Box>
      </>
    );
  },
);
ButtonGroup.displayName = "ButtonGroup";

// ---------------------------------------------------------------------------
// Tag / TagLabel / TagCloseButton — ported from theme's tag.mjs (size "md",
// variant "subtle", colorScheme "gray" defaults).
// ---------------------------------------------------------------------------
const TAG_SIZES: Record<
  string,
  { minH: string; fontSize: string; px: string }
> = {
  sm: { minH: "20px", fontSize: FONT_SIZES.xs, px: "8px" },
  md: { minH: "24px", fontSize: FONT_SIZES.sm, px: "8px" },
  lg: { minH: "32px", fontSize: FONT_SIZES.md, px: "12px" },
};

export interface TagProps extends BoxProps {
  size?: "sm" | "md" | "lg";
  colorScheme?: string;
  variant?: "subtle" | "solid" | "outline";
}

export const Tag = forwardRef<HTMLDivElement, TagProps>(
  (
    { size = "md", colorScheme = "gray", variant = "subtle", style, ...rest },
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const s = TAG_SIZES[size] ?? TAG_SIZES.md;
    const variantStyle: CSSProperties =
      variant === "solid"
        ? { backgroundColor: colorProp(`${colorScheme}.500`), color: "#fff" }
        : variant === "outline"
          ? {
              color: colorProp(`${colorScheme}.500`),
              boxShadow: `inset 0 0 0px 1px ${colorProp(`${colorScheme}.500`)}`,
            }
          : {
              backgroundColor: colorProp(`${colorScheme}.100`),
              color: colorProp(`${colorScheme}.800`),
            };
    return (
      <Box
        ref={ref}
        display="inline-flex"
        alignItems="center"
        fontWeight="medium"
        style={{
          lineHeight: 1.2,
          minHeight: s.minH,
          fontSize: s.fontSize,
          ...variantStyle,
          ...style,
        }}
        borderRadius="md"
        px={s.px}
        {...rest}
      />
    );
  },
);
Tag.displayName = "Tag";

export const TagLabel = (props: BoxProps) => (
  <Box as="span" style={{ overflow: "visible" }} {...props} />
);

export const TagCloseButton = ({ style, ...rest }: BoxProps) => (
  <Box
    as="button"
    type="button"
    ml={1.5}
    fontSize="lg"
    w={5}
    h={5}
    borderRadius="full"
    display="inline-flex"
    alignItems="center"
    justifyContent="center"
    style={{
      opacity: 0.5,
      background: "none",
      border: "none",
      cursor: "pointer",
      ...style,
    }}
    {...rest}
  >
    ✕
  </Box>
);

// ---------------------------------------------------------------------------
// Skeleton / SkeletonCircle / SkeletonText — ported from
// @chakra-ui/react's skeleton.mjs: startColor/endColor default to
// gray.100/gray.400 (light), animated background between them.
// ---------------------------------------------------------------------------
export interface SkeletonProps extends BoxProps {
  startColor?: string;
  endColor?: string;
  isLoaded?: boolean;
  speed?: number;
  fitContent?: boolean;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      startColor,
      endColor,
      isLoaded,
      speed = 0.8,
      fitContent,
      borderRadius,
      style,
      ...rest
    },
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const { colorMode } = useColorMode();
    const start =
      colorProp(startColor) ||
      (colorMode === "dark" ? "#2d333b" : colorProp("gray.100"));
    const end =
      colorProp(endColor) ||
      (colorMode === "dark" ? "#444c56" : colorProp("gray.400"));
    if (isLoaded) {
      return <Box ref={ref} style={style} {...rest} />;
    }
    return (
      <Box
        ref={ref}
        borderRadius={borderRadius ?? "sm"}
        style={{
          boxShadow: "none",
          cursor: "default",
          color: "transparent",
          pointerEvents: "none",
          userSelect: "none",
          opacity: 0.9,
          width: fitContent ? "fit-content" : undefined,
          background: start,
          borderColor: end,
          animation: `${speed}s linear infinite alternate skeleton-bg-fade`,
          ...style,
        }}
        {...rest}
      >
        <style>{`@keyframes skeleton-bg-fade { from { background: ${start}; border-color: ${start}; } to { background: ${end}; border-color: ${end}; } }`}</style>
      </Box>
    );
  },
);
Skeleton.displayName = "Skeleton";

export const SkeletonCircle = ({
  size = "32px",
  ...rest
}: SkeletonProps & { size?: any }) => (
  <Skeleton borderRadius="full" boxSize={size} {...rest} />
);

export interface SkeletonTextProps extends SkeletonProps {
  noOfLines?: number;
  spacing?: any;
  skeletonHeight?: any;
}

export const SkeletonText = ({
  noOfLines = 3,
  spacing = "8px",
  skeletonHeight = "8px",
  isLoaded,
  ...rest
}: SkeletonTextProps) => {
  const numbers = Array.from({ length: noOfLines }, (_, i) => i + 1);
  if (isLoaded) return null;
  return (
    <Box>
      {numbers.map((n) => (
        <Skeleton
          key={n}
          mb={n === numbers.length ? 0 : spaceProp(spacing)}
          width={n === numbers.length && numbers.length > 1 ? "80%" : "100%"}
          height={skeletonHeight}
          {...rest}
        />
      ))}
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Fade / ScaleFade / Collapse / Slide — every real usage in this codebase
// renders with `in={true}` (static), so these are conditional pass-throughs
// rather than a framer-motion re-implementation.
// ---------------------------------------------------------------------------
interface TransitionWrapperProps {
  in?: boolean;
  children: ReactNode;
  [key: string]: any;
}

export const Fade = ({ in: isIn = true, children }: TransitionWrapperProps) =>
  isIn ? <>{children}</> : null;
export const ScaleFade = ({
  in: isIn = true,
  children,
}: TransitionWrapperProps) => (isIn ? <>{children}</> : null);
export const Collapse = ({
  in: isIn = true,
  children,
}: TransitionWrapperProps) => (isIn ? <>{children}</> : null);
export const Slide = ({ in: isIn = true, children }: TransitionWrapperProps) =>
  isIn ? <>{children}</> : null;

// ---------------------------------------------------------------------------
// Checkbox — control size/colours ported from theme's checkbox.mjs.
// ---------------------------------------------------------------------------
const CHECKBOX_SIZE_PX: Record<string, number> = { sm: 12, md: 16, lg: 20 };

export interface CheckboxProps
  extends
    StyleProps,
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "color" | "translate" | "size" | "height" | "width"
    > {
  isChecked?: boolean;
  colorScheme?: string;
  size?: "sm" | "md" | "lg";
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      isChecked,
      checked,
      colorScheme = "blue",
      size = "md",
      style,
      children,
      ...styleAndRest
    },
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const rest = omitStyleProps(styleAndRest);
    const boxStyle = buildStyle(styleAndRest);
    const dim = `${CHECKBOX_SIZE_PX[size] ?? 16}px`;
    return (
      <Box
        as="label"
        display="inline-flex"
        alignItems="center"
        gap={2}
        cursor="pointer"
        style={boxStyle}
      >
        <input
          ref={ref}
          type="checkbox"
          checked={isChecked ?? checked}
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            width: dim,
            height: dim,
            border: "2px solid var(--border-color, #e2e8f0)",
            borderRadius: "3px",
            cursor: "pointer",
            accentColor: colorProp(`${colorScheme}.500`),
            ...style,
          }}
          {...rest}
        />
        {children}
      </Box>
    );
  },
);
Checkbox.displayName = "Checkbox";

// ---------------------------------------------------------------------------
// Progress — track/filled colours + size heights ported from theme's
// progress.mjs.
// ---------------------------------------------------------------------------
const PROGRESS_TRACK_HEIGHT: Record<string, string> = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
};

export interface ProgressProps extends BoxProps {
  value?: number;
  colorScheme?: string;
  size?: "xs" | "sm" | "md" | "lg";
  isIndeterminate?: boolean;
}

export const Progress = ({
  value = 0,
  colorScheme = "blue",
  size = "md",
  isIndeterminate,
  ...rest
}: ProgressProps) => {
  const { colorMode } = useColorMode();
  return (
    <Box
      borderRadius="2px"
      overflow="hidden"
      bg={colorMode === "dark" ? "whiteAlpha.300" : "gray.100"}
      height={PROGRESS_TRACK_HEIGHT[size] ?? PROGRESS_TRACK_HEIGHT.md}
      {...rest}
    >
      <div
        style={{
          width: isIndeterminate
            ? "50%"
            : `${Math.max(0, Math.min(100, value))}%`,
          height: "100%",
          backgroundColor: colorProp(
            colorMode === "dark" ? `${colorScheme}.200` : `${colorScheme}.500`,
          ),
          transition: "width 0.3s ease",
        }}
      />
    </Box>
  );
};

// ---------------------------------------------------------------------------
// FormControl / FormLabel / FormErrorMessage
// ---------------------------------------------------------------------------
const FormControlContext = createContext<{
  isInvalid?: boolean;
  isRequired?: boolean;
}>({});

export interface FormControlProps extends BoxProps {
  isRequired?: boolean;
  isInvalid?: boolean;
  variant?: string;
}

export const FormControl = ({
  isRequired,
  isInvalid,
  variant: _variant,
  children,
  ...rest
}: FormControlProps) => (
  <FormControlContext.Provider value={{ isInvalid, isRequired }}>
    <Box {...rest}>{children}</Box>
  </FormControlContext.Provider>
);

export const FormLabel = ({ children, ...rest }: BoxProps) => {
  const { isRequired } = useContext(FormControlContext);
  return (
    <Box
      as="label"
      display="block"
      mb={2}
      fontSize="md"
      fontWeight="medium"
      {...rest}
    >
      {children}
      {isRequired && (
        <span style={{ color: colorProp("red.500"), marginLeft: "4px" }}>
          *
        </span>
      )}
    </Box>
  );
};

export const FormErrorMessage = ({ children, ...rest }: BoxProps) => {
  const { isInvalid } = useContext(FormControlContext);
  if (!isInvalid || !children) return null;
  return (
    <Text
      display="flex"
      alignItems="center"
      color={colorProp("red.500")}
      fontSize="sm"
      mt={2}
      {...rest}
    >
      {children}
    </Text>
  );
};

// ---------------------------------------------------------------------------
// useDisclosure
// ---------------------------------------------------------------------------
export function useDisclosure(props: { defaultIsOpen?: boolean } = {}) {
  const [isOpen, setIsOpen] = useState(!!props.defaultIsOpen);
  return {
    isOpen,
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false),
    onToggle: () => setIsOpen((v) => !v),
  };
}

// ---------------------------------------------------------------------------
// Floating position helper — shared by Menu, Popover, Tooltip. Renders into
// a document.body portal at a `position: fixed` coordinate computed from
// the trigger's bounding box, so dropdowns escape any `overflow:hidden`
// scroll container instead of being clipped (Chakra uses Popper.js for
// this; a fixed-position calculation is a deliberate lighter substitute).
// ---------------------------------------------------------------------------
function useFloatingPosition(
  triggerRef: RefObject<HTMLElement>,
  isOpen: boolean,
  placement: string,
) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [computedPlacement, setComputedPlacement] = useState<string>(placement);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) {
      setCoords(null);
      return;
    }
    const update = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      let effectivePlacement = placement;

      // Auto-flip horizontal placement if it would overflow the screen
      if (placement.endsWith("start") && rect.left > window.innerWidth / 2) {
        effectivePlacement = placement.replace("start", "end");
      } else if (placement.endsWith("end") && rect.right < window.innerWidth / 2) {
        effectivePlacement = placement.replace("end", "start");
      }

      setComputedPlacement(effectivePlacement);

      const isTop = effectivePlacement.startsWith("top");
      const isEnd = effectivePlacement.endsWith("end") || effectivePlacement.endsWith("right");
      setCoords({
        top: isTop ? rect.top : rect.bottom,
        left: isEnd ? rect.right : rect.left,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen, placement, triggerRef]);

  const isTop = computedPlacement.startsWith("top");
  const isEnd = computedPlacement.endsWith("end") || computedPlacement.endsWith("right");
  return {
    coords,
    transform:
      `${isTop ? "translateY(-100%)" : ""} ${isEnd ? "translateX(-100%)" : ""}`.trim() ||
      undefined,
  };
}

function useOutsideClick(
  refs: RefObject<HTMLElement>[],
  onOutside: () => void,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (refs.every((r) => r.current && !r.current.contains(target)))
        onOutside();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [active, onOutside, refs]);
}

// Chakra's Portal escapes clipped ancestors via a real DOM portal.
export const Portal = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
};

// ---------------------------------------------------------------------------
// Tooltip — bg/color/padding/radius ported from theme's tooltip.mjs.
// ---------------------------------------------------------------------------
export const Tooltip = ({
  children,
  label,
  placement = "top",
  hasArrow: _hasArrow,
  className,
  style,
  ...rest
}: any) => {
  const { colorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const { coords, transform } = useFloatingPosition(
    triggerRef,
    isOpen && !!label,
    placement,
  );
  const child =
    React.Children.count(children) === 1
      ? (React.Children.only(children) as any)
      : null;

  const setRef = (node: HTMLElement | null) => {
    (triggerRef as any).current = node;
  };

  return (
    <>
      <span
        ref={setRef as any}
        className={className}
        style={{ display: "inline-block", ...style }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        {child ?? children}
      </span>
      {isOpen && label && coords && (
        <Portal>
          <Box
            position="fixed"
            top={`${coords.top}px`}
            left={`${coords.left}px`}
            bg={
              colorMode === "dark"
                ? colorProp("gray.300")
                : colorProp("gray.700")
            }
            color={
              colorMode === "dark"
                ? colorProp("gray.900")
                : colorProp("whiteAlpha.900")
            }
            px={2}
            py={0.5}
            borderRadius="sm"
            fontWeight="medium"
            fontSize="sm"
            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            maxW="20rem"
            zIndex={1800}
            pointerEvents="none"
            style={{ transform, marginTop: "6px" }}
            {...rest}
          >
            {label}
          </Box>
        </Portal>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// useToast — ported from Chakra's default position ("bottom") and solid
// status styling; a lightweight module-level pub/sub store instead of the
// real @chakra-ui toast manager.
// ---------------------------------------------------------------------------
interface ToastOptions {
  title?: string;
  description?: string;
  status?: "success" | "error" | "warning" | "info";
  duration?: number | null;
  isClosable?: boolean;
}
interface ToastItem extends ToastOptions {
  id: number;
}

const TOAST_STATUS_BG: Record<string, string> = {
  success: "green.500",
  error: "red.500",
  warning: "orange.500",
  info: "blue.500",
};

let toastItems: ToastItem[] = [];
let toastListeners: ((items: ToastItem[]) => void)[] = [];
let toastIdCounter = 0;

function notifyToastListeners() {
  toastListeners.forEach((l) => l(toastItems));
}

function dismissToast(id: number) {
  toastItems = toastItems.filter((t) => t.id !== id);
  notifyToastListeners();
}

function pushToast(opts: ToastOptions) {
  const id = toastIdCounter++;
  const item: ToastItem = { id, duration: 5000, status: "info", ...opts };
  toastItems = [...toastItems, item];
  notifyToastListeners();
  if (item.duration !== null) {
    setTimeout(() => dismissToast(id), item.duration ?? 5000);
  }
}

export function useToast() {
  return (opts: ToastOptions) => pushToast(opts);
}

export const ToastViewport = () => {
  const [items, setItems] = useState<ToastItem[]>(toastItems);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    toastListeners.push(setItems);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setItems);
    };
  }, []);

  if (!mounted || items.length === 0) return null;

  return createPortal(
    <Box
      position="fixed"
      bottom={4}
      style={{ left: "50%", transform: "translateX(-50%)" }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
      zIndex={1700}
    >
      {items.map((t) => (
        <Flex
          key={t.id}
          alignItems="center"
          justifyContent="space-between"
          gap={3}
          minW="200px"
          bg={colorProp(TOAST_STATUS_BG[t.status ?? "info"])}
          color="#fff"
          px={4}
          py={3}
          borderRadius="md"
          boxShadow={SHADOWS.lg}
        >
          <Box>
            {t.title && (
              <Text fontWeight="bold" fontSize="sm">
                {t.title}
              </Text>
            )}
            {t.description && <Text fontSize="sm">{t.description}</Text>}
          </Box>
          {t.isClosable && (
            <Box
              as="button"
              onClick={() => dismissToast(t.id)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                opacity: 0.8,
              }}
            >
              ✕
            </Box>
          )}
        </Flex>
      ))}
    </Box>,
    document.body,
  );
};

// ---------------------------------------------------------------------------
// Tabs / TabList / Tab / TabPanels / TabPanel — variant "line" (the only
// variant used in this codebase), sizing/colours ported from theme's
// tabs.mjs.
// ---------------------------------------------------------------------------
const TabsContext = createContext<{
  index: number;
  setIndex: (i: number) => void;
} | null>(null);

export interface TabsProps extends Omit<BoxProps, "onChange"> {
  index?: number;
  defaultIndex?: number;
  onChange?: (index: number) => void;
  isLazy?: boolean;
  variant?: string;
}

export const Tabs = ({
  index,
  defaultIndex = 0,
  onChange,
  isLazy: _isLazy,
  variant: _variant,
  children,
  ...rest
}: TabsProps) => {
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const activeIndex = index ?? internalIndex;
  const setIndex = (i: number) => {
    setInternalIndex(i);
    onChange?.(i);
  };
  return (
    <TabsContext.Provider value={{ index: activeIndex, setIndex }}>
      <Box {...rest}>{children}</Box>
    </TabsContext.Provider>
  );
};

export const TabList = (props: BoxProps) => {
  const { children, ...rest } = props;
  let i = -1;
  return (
    <Flex
      borderBottom="2px solid"
      borderColor={colorProp("gray.200")}
      {...rest}
    >
      {React.Children.map(children, (child: any) => {
        if (child?.type !== Tab) return child;
        i += 1;
        return React.cloneElement(child, { __index: i });
      })}
    </Flex>
  );
};

export const Tab = ({ children, onClick, __index, style, ...rest }: any) => {
  const ctx = useContext(TabsContext);
  const isSelected = ctx?.index === __index;
  return (
    <Box
      as="button"
      display="flex"
      alignItems="center"
      justifyContent={"center"}
      border="none"
      bg="transparent"
      color={isSelected ? colorProp("blue.600") : "inherit"}
      fontSize="md"
      py={2}
      px={4}
      cursor="pointer"
      style={{
        marginBottom: "-2px",
        borderBottom: isSelected ? "2px solid white" : "2px solid transparent",
        transition: "color 0.2s, border-color 0.2s",
        ...style,
      }}
      onClick={(e: any) => {
        onClick?.(e);
        if (__index !== undefined) ctx?.setIndex(__index);
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};

export const TabPanels = (props: BoxProps) => {
  const { children, ...rest } = props;
  const ctx = useContext(TabsContext);
  const items = React.Children.toArray(children);
  return <Box {...rest}>{items[ctx?.index ?? 0]}</Box>;
};

export const TabPanel = (props: BoxProps) => <Box {...props} />;

// ---------------------------------------------------------------------------
// Accordion / AccordionItem / AccordionButton / AccordionPanel /
// AccordionIcon — ported from theme's accordion.mjs.
// ---------------------------------------------------------------------------
const AccordionContext = createContext<{
  isOpen: (i: number) => boolean;
  toggle: (i: number) => void;
} | null>(null);
const AccordionItemContext = createContext<number>(0);

export interface AccordionProps extends BoxProps {
  defaultIndex?: number | number[];
  allowMultiple?: boolean;
}

export const Accordion = ({
  defaultIndex = [],
  allowMultiple,
  children,
  ...rest
}: AccordionProps) => {
  const initial = Array.isArray(defaultIndex) ? defaultIndex : [defaultIndex];
  const [openSet, setOpenSet] = useState<Set<number>>(new Set(initial));

  const toggle = (i: number) => {
    setOpenSet((prev) => {
      const next = allowMultiple ? new Set(prev) : new Set<number>();
      if (prev.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  let idx = -1;
  return (
    <AccordionContext.Provider
      value={{ isOpen: (i) => openSet.has(i), toggle }}
    >
      <Box {...rest}>
        {React.Children.map(children, (child: any) => {
          if (child?.type !== AccordionItem) return child;
          idx += 1;
          return (
            <AccordionItemContext.Provider value={idx}>
              {child}
            </AccordionItemContext.Provider>
          );
        })}
      </Box>
    </AccordionContext.Provider>
  );
};

export const AccordionItem = (props: BoxProps) => (
  <Box borderTop="1px solid" borderColor={colorProp("gray.200")} {...props} />
);

export const AccordionButton = ({ children, style, ...rest }: BoxProps) => {
  const ctx = useContext(AccordionContext);
  const index = useContext(AccordionItemContext);
  return (
    <Box
      as="button"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      w="100%"
      border="none"
      bg="transparent"
      color="inherit"
      fontSize="md"
      px={4}
      py={2}
      cursor="pointer"
      style={{ transition: "background 0.2s", ...style }}
      onClick={() => ctx?.toggle(index)}
      {...rest}
    >
      {children}
    </Box>
  );
};

export const AccordionPanel = ({ children, ...rest }: BoxProps) => {
  const ctx = useContext(AccordionContext);
  const index = useContext(AccordionItemContext);
  if (!ctx?.isOpen(index)) return null;
  return (
    <Box pt={2} px={4} pb={5} {...rest}>
      {children}
    </Box>
  );
};

export const AccordionIcon = () => {
  const ctx = useContext(AccordionContext);
  const index = useContext(AccordionItemContext);
  const open = !!ctx?.isOpen(index);
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "1.25em",
        transition: "transform 0.2s ease",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      ▾
    </span>
  );
};

// ---------------------------------------------------------------------------
// Menu / MenuButton / MenuList / MenuItem / MenuDivider — bg/shadow/spacing
// ported from theme's menu.mjs.
// ---------------------------------------------------------------------------
const MenuContext = createContext<{
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  triggerRef: RefObject<HTMLElement>;
  placement: string;
} | null>(null);

export const Menu = ({
  children,
  placement = "bottom-start",
  isOpen: isOpenProp,
}: {
  children: ReactNode;
  placement?: string;
  isOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(!!isOpenProp);
  const triggerRef = useRef<HTMLElement>(null);
  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  return (
    <MenuContext.Provider
      value={{ isOpen, toggle, close, triggerRef, placement }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const MenuButton = ({ as: Comp, children, onClick, style, ...rest }: any) => {
  const ctx = useContext(MenuContext);
  const setRef = (node: HTMLElement | null) => {
    if (ctx) (ctx.triggerRef as any).current = node;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(e);
    ctx?.toggle();
  };

  if (Comp) {
    return (
      <Comp ref={setRef} onClick={handleClick} style={style} {...rest}>
        {children}
      </Comp>
    );
  }

  return (
    <span
      ref={setRef}
      style={{ display: "inline-block", cursor: "pointer", ...style }}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </span>
  );
};

export const MenuList = forwardRef<HTMLDivElement, BoxProps>(
  ({ children, style, ...rest }, ref) => {
    const ctx = useContext(MenuContext);
    const { colorMode } = useColorMode();
    const listRef = useRef<HTMLDivElement>(null);
    const isOpen = !!ctx?.isOpen;
    const { coords, transform } = useFloatingPosition(
      ctx?.triggerRef ?? { current: null },
      isOpen,
      ctx?.placement ?? "bottom-start",
    );

    useOutsideClick(
      [listRef, ctx?.triggerRef ?? { current: null }],
      () => ctx?.close(),
      isOpen,
    );

    if (!isOpen || !coords) return null;

    return (
      <Portal>
        <Box
          ref={(node: HTMLDivElement) => {
            (listRef as any).current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as any).current = node;
          }}
          position="fixed"
          top={`${coords.top}px`}
          left={`${coords.left}px`}
          bg={colorMode === "dark" ? colorProp("gray.700") : "#fff"}
          boxShadow={
            colorMode === "dark"
              ? (SHADOWS["dark-lg"] ?? SHADOWS.lg)
              : SHADOWS.sm
          }
          borderRadius="md"
          borderWidth="1px"
          borderColor={colorProp("gray.200")}
          overflow="hidden"
          minW="14rem"
          py={2}
          zIndex={1000}
          style={{
            transform,
            marginTop: ctx?.placement?.startsWith("top") ? "-8px" : "4px",
            ...style,
          }}
          {...rest}
        >
          {children}
        </Box>
      </Portal>
    );
  },
);
MenuList.displayName = "MenuList";

export const MenuItem = forwardRef<HTMLDivElement, BoxProps>(
  ({ children, onClick, style, ...rest }, ref) => {
    const ctx = useContext(MenuContext);
    const { colorMode } = useColorMode();
    const [hover, setHover] = useState(false);
    return (
      <Box
        ref={ref}
        as="div"
        role="menuitem"
        cursor="pointer"
        px={3}
        py={1.5}
        bg={
          hover
            ? colorMode === "dark"
              ? colorProp("whiteAlpha.100")
              : colorProp("gray.100")
            : "transparent"
        }
        style={{ transition: "background 0.1s ease-in", ...style }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={(e: any) => {
          onClick?.(e);
          ctx?.close();
        }}
        {...rest}
      >
        {children}
      </Box>
    );
  },
);
MenuItem.displayName = "MenuItem";

export const MenuDivider = () => (
  <Box
    as="hr"
    my={2}
    style={{
      border: 0,
      borderBottom: "1px solid",
      borderColor: "inherit",
      opacity: 0.6,
    }}
  />
);

// ---------------------------------------------------------------------------
// Popover / PopoverTrigger / PopoverContent / PopoverHeader / PopoverBody /
// PopoverFooter / PopoverCloseButton / PopoverArrow — ported from theme's
// popover.mjs.
// ---------------------------------------------------------------------------
const PopoverContext = createContext<{
  triggerRef: RefObject<HTMLElement>;
  placement: string;
  isHoverTrigger: boolean;
  onTriggerEnter: () => void;
  onTriggerLeave: () => void;
} | null>(null);

export const Popover = ({
  children,
  isOpen: isOpenProp,
  onClose,
  placement = "bottom",
  trigger,
}: {
  children: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  placement?: string;
  trigger?: "click" | "hover";
}) => {
  const isHoverTrigger = trigger === "hover";
  const [hoverOpen, setHoverOpen] = useState(false);
  const isOpen = isHoverTrigger ? hoverOpen : !!isOpenProp;
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    [triggerRef, contentRef],
    () => onClose?.(),
    isOpen && !isHoverTrigger,
  );

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setHoverOpen(false), 100);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  return (
    <PopoverContext.Provider
      value={{
        triggerRef,
        placement,
        isHoverTrigger,
        onTriggerEnter: () => {
          cancelClose();
          setHoverOpen(true);
        },
        onTriggerLeave: scheduleClose,
      }}
    >
      {React.Children.map(children, (child: any) =>
        child?.type === PopoverContent
          ? React.cloneElement(child, {
              __isOpen: isOpen,
              __contentRef: contentRef,
              ...(isHoverTrigger
                ? { onMouseEnter: cancelClose, onMouseLeave: scheduleClose }
                : {}),
            })
          : child,
      )}
    </PopoverContext.Provider>
  );
};

export const PopoverTrigger = ({ children }: { children: ReactNode }) => {
  const ctx = useContext(PopoverContext);
  const setRef = (node: HTMLElement | null) => {
    if (ctx) (ctx.triggerRef as any).current = node;
  };
  const child = React.Children.only(children) as any;
  return React.cloneElement(child, {
    ref: (node: HTMLElement) => {
      setRef(node);
      const { ref: childRef } = child;
      if (typeof childRef === "function") childRef(node);
      else if (childRef) childRef.current = node;
    },
    ...(ctx?.isHoverTrigger
      ? {
          onMouseEnter: (e: any) => {
            child.props.onMouseEnter?.(e);
            ctx.onTriggerEnter();
          },
          onMouseLeave: (e: any) => {
            child.props.onMouseLeave?.(e);
            ctx.onTriggerLeave();
          },
        }
      : {}),
  });
};

export const PopoverContent = forwardRef<
  HTMLDivElement,
  BoxProps & { __isOpen?: boolean; __contentRef?: RefObject<HTMLDivElement> }
>(({ children, style, __isOpen, __contentRef, ...rest }, ref) => {
  const ctx = useContext(PopoverContext);
  const { colorMode } = useColorMode();
  const isOpen = !!__isOpen;
  const { coords, transform } = useFloatingPosition(
    ctx?.triggerRef ?? { current: null },
    isOpen,
    ctx?.placement ?? "bottom",
  );

  if (!isOpen || !coords) return null;

  return (
    <Portal>
      <Box
        ref={(node: HTMLDivElement) => {
          if (__contentRef) (__contentRef as any).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as any).current = node;
        }}
        position="fixed"
        top={`${coords.top}px`}
        left={`${coords.left}px`}
        bg={colorMode === "dark" ? colorProp("gray.700") : "#fff"}
        w="20rem"
        border="1px solid"
        borderColor={colorProp("gray.200")}
        borderRadius="md"
        boxShadow={SHADOWS.sm}
        zIndex={1500}
        style={{ transform, marginTop: "4px", ...style }}
        {...rest}
      >
        {children}
      </Box>
    </Portal>
  );
});
PopoverContent.displayName = "PopoverContent";

export const PopoverHeader = (props: BoxProps) => (
  <Box
    px={3}
    py={2}
    borderBottom="1px solid"
    borderColor={colorProp("gray.200")}
    {...props}
  />
);
export const PopoverBody = (props: BoxProps) => (
  <Box px={3} py={2} {...props} />
);
export const PopoverFooter = (props: BoxProps) => (
  <Box
    px={3}
    py={2}
    borderTop="1px solid"
    borderColor={colorProp("gray.200")}
    {...props}
  />
);
export const PopoverCloseButton = ({ style, ...rest }: BoxProps) => (
  <Box
    as="button"
    position="absolute"
    top={1}
    right={2}
    p={2}
    borderRadius="md"
    style={{ background: "none", border: "none", cursor: "pointer", ...style }}
    {...rest}
  >
    ✕
  </Box>
);
export const PopoverArrow = () => null;

// ---------------------------------------------------------------------------
// Modal / ModalOverlay / ModalContent / ModalHeader / ModalBody /
// ModalFooter / ModalCloseButton — size/colour defaults ported from theme's
// modal.mjs (size "md" = sizes.md = 28rem, not centred by default).
// ---------------------------------------------------------------------------
const MODAL_SIZES: Record<string, string> = {
  xs: SIZE_TOKENS.xs,
  sm: SIZE_TOKENS.sm,
  md: SIZE_TOKENS.md,
  lg: SIZE_TOKENS.lg,
  xl: SIZE_TOKENS.xl,
  "2xl": SIZE_TOKENS["2xl"],
  "3xl": SIZE_TOKENS["3xl"],
  "4xl": SIZE_TOKENS["4xl"],
  "5xl": SIZE_TOKENS["5xl"],
  "6xl": SIZE_TOKENS["6xl"],
  full: "100vw",
};

const ModalContext = createContext<{
  onClose: () => void;
  closeOnOverlayClick: boolean;
  isCentered?: boolean;
  size: string;
} | null>(null);

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  closeOnOverlayClick?: boolean;
  isCentered?: boolean;
  size?: string;
  blockScrollOnMount?: boolean;
  children: ReactNode;
}

export const Modal = ({
  isOpen,
  onClose,
  closeOnOverlayClick = true,
  isCentered = true,
  size = "md",
  blockScrollOnMount = true,
  children,
}: ModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !blockScrollOnMount) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, blockScrollOnMount]);

  if (!isOpen) return null;

  return (
    <ModalContext.Provider
      value={{ onClose, closeOnOverlayClick, isCentered, size }}
    >
      <Portal>
        {/* Transparent click-catcher layer: centers ModalContent with flexbox */}
        <div
          onClick={closeOnOverlayClick ? () => onClose() : undefined}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1401,
            display: "flex",
            alignItems: isCentered ? "center" : "flex-start",
            justifyContent: "center",
            overflowY: "auto",
            padding: isCentered ? "16px" : "60px 16px 16px",
          }}
        >
          {children}
        </div>
      </Portal>
    </ModalContext.Provider>
  );
};

export const ModalOverlay = ({ bg, onClick, ...rest }: BoxProps) => {
  // Visual backdrop: z-index 0 within the click-catcher (z-index 1401) stacking context.
  // ModalContent at z-index 1 (default) or higher appears on top.
  // pointerEvents:none lets clicks fall through to the transparent click-catcher wrapper.
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100%"
      h="100%"
      bg={bg ?? "blackAlpha.600"}
      zIndex={0}
      pointerEvents="none"
      {...rest}
    />
  );
};

export const ModalContent = forwardRef<HTMLDivElement, BoxProps>(
  ({ children, style, ...rest }, ref) => {
    const ctx = useContext(ModalContext);
    const { colorMode } = useColorMode();
    const maxW = MODAL_SIZES[ctx?.size ?? "md"] ?? MODAL_SIZES.md;
    return (
      <Box
        ref={ref}
        position="relative"
        bg={colorMode === "dark" ? "#181818" : "#ffffff"}
        boxShadow={colorMode === "dark" ? SHADOWS["dark-lg"] : SHADOWS.lg}
        borderRadius="md"
        color="inherit"
        maxW={maxW}
        w="calc(100% - 32px)"
        // zIndex as a normal prop so callers can override it via {...rest}.
        // No zIndex in the hardcoded style object to avoid overriding caller values.
        zIndex={1}
        style={{ display: "flex", flexDirection: "column", ...style }}
        onClick={(e: any) => e.stopPropagation()}
        {...rest}
      >
        {children}
      </Box>
    );
  },
);
ModalContent.displayName = "ModalContent";

export const ModalHeader = (props: BoxProps) => (
  <Box px={6} py={4} fontSize="xl" fontWeight="semibold" {...props} />
);
export const ModalBody = (props: BoxProps) => (
  <Box px={6} py={2} flex="1" {...props} />
);
export const ModalFooter = (props: BoxProps) => (
  <Box
    px={6}
    py={4}
    display="flex"
    justifyContent="flex-end"
    gap={2}
    {...props}
  />
);
export const ModalCloseButton = ({ style, ...rest }: BoxProps) => {
  const ctx = useContext(ModalContext);
  return (
    <Box
      as="button"
      position="absolute"
      top={2}
      right={3}
      p={2}
      borderRadius="md"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        ...style,
      }}
      onClick={() => ctx?.onClose()}
      {...rest}
    >
      ✕
    </Box>
  );
};

// ---------------------------------------------------------------------------
// AlertDialog family — same visuals/behaviour as Modal; Chakra's real
// AlertDialog nests Content inside Overlay (Modal keeps them siblings).
// ---------------------------------------------------------------------------
export const AlertDialog = Modal as unknown as (
  props: ModalProps & { leastDestructiveRef?: RefObject<HTMLElement> },
) => JSX.Element;
export const AlertDialogOverlay = ({ children }: { children: ReactNode }) => (
  <>
    <ModalOverlay />
    {children}
  </>
);
export const AlertDialogContent = ModalContent;
export const AlertDialogHeader = ModalHeader;
export const AlertDialogBody = ModalBody;
export const AlertDialogFooter = ModalFooter;
