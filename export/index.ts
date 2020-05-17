// a11y
export { AriaRole } from '../src/a11y/aria-role';

// Core
export { Builder as PersonaBuilder } from '../src/core/builder';
export { PersonaContext } from '../src/core/persona-context';

// Inputs
export { attribute as attributeIn } from '../src/input/attribute';
export { handler } from '../src/input/handler';
export { hasAttribute } from '../src/input/has-attribute';
export { hasClass } from '../src/input/has-class';
export { mediaQuery } from '../src/input/media-query';
export { onDom } from '../src/input/on-dom';
export { onInput } from '../src/input/on-input';
export { onKeydown } from '../src/input/on-keydown';

// Main
export { api } from '../src/main/api';
export { element, ComponentSpec } from '../src/main/element';
export { host } from '../src/main/host';
export { repeated } from '../src/main/repeated';
export { single } from '../src/main/single';

// Outputs
export { attribute as attributeOut } from '../src/output/attribute';
export { caller } from '../src/output/caller';
export { classlist } from '../src/output/classlist';
export { classToggle } from '../src/output/class-toggle';
export { dispatcher, DispatchFn } from '../src/output/dispatcher';
export { noop } from '../src/output/noop';
export { setAttribute } from '../src/output/set-attribute';
export { style } from '../src/output/style';
export { textContent } from '../src/output/text-content';

// Types
export { CustomElementCtrl } from '../src/types/custom-element-ctrl';

// Util
export { mapOutput } from '../src/util/map-output';
export { mutationObservable } from '../src/util/mutation-observable';
export { splitOutput } from '../src/util/split-output';

// Location
export { LocationService, Route, RouteSpec } from '../src/location/location-service';
export { fromPattern } from '../src/location/location-converter';

// Render spec
export { InnerHtmlRenderSpec } from '../src/render/inner-html-render-spec';
export { $innerHtmlParseService, ParseType } from '../src/render/inner-html-parse-service';
export { InnerHtmlParseService } from '../src/render/inner-html-parse-service';

export { NoopRenderSpec } from '../src/render/noop-render-spec';
export { RenderSpec } from '../src/render/render-spec';
export { SimpleElementRenderSpec } from '../src/render/simple-element-render-spec';
// export { renderFromTemplate } from '../src/render/template-render-spec';

export { booleanParser, enumParser, integerParser, listParser, mapParser, stringParser } from '../src/util/parsers';
