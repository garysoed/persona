import {RenderElementSpec} from './render-element-spec';
import {RenderNodeSpec} from './render-node-spec';
import {RenderTextNodeSpec} from './render-text-node-spec';


export type RenderSpec = //RenderCustomElementSpec<any>|
    RenderElementSpec|
    // RenderHtmlSpec|
    RenderNodeSpec<any>|
    RenderTextNodeSpec;
