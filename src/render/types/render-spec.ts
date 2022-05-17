import {RenderCustomElementSpec} from './render-custom-element-spec';
import {RenderFragmentSpec} from './render-fragment-spec';
import {RenderHtmlSpec} from './render-html-spec';
import {RenderNodeSpec} from './render-node-spec';
import {RenderTemplateSpec} from './render-template-spec';
import {RenderTextNodeSpec} from './render-text-node-spec';


export type RenderSpec = RenderCustomElementSpec<any, any>|
    RenderFragmentSpec|
    RenderHtmlSpec|
    RenderNodeSpec<any>|
    RenderTextNodeSpec|
    RenderTemplateSpec<any>;
