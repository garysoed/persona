import {RenderCustomElementSpec} from './render-custom-element-spec';
import {RenderElementSpec} from './render-element-spec';
import {RenderFragmentSpec} from './render-fragment-spec';
import {RenderHtmlSpec} from './render-html-spec';
import {RenderNodeSpec} from './render-node-spec';
import {RenderTextNodeSpec} from './render-text-node-spec';


export type RenderSpec = RenderCustomElementSpec<any>|
    RenderElementSpec|
    RenderFragmentSpec|
    RenderHtmlSpec|
    RenderNodeSpec|
    RenderTextNodeSpec;
