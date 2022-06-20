import {RenderElementSpec} from './render-element-spec';
import {RenderFragmentSpec} from './render-fragment-spec';
import {RenderNodeSpec} from './render-node-spec';
import {RenderStringSpec} from './render-string-spec';
import {RenderTemplateSpec} from './render-template-spec';
import {RenderTextNodeSpec} from './render-text-node-spec';


export type RenderSpec = RenderElementSpec<any, any>|
    RenderFragmentSpec|
    RenderStringSpec<any, any>|
    RenderNodeSpec<any>|
    RenderTextNodeSpec|
    RenderTemplateSpec<any>;
