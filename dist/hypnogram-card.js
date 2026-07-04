/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function computeDomain(entityId) {
    return entityId.substr(0, entityId.indexOf("."));
}

var NumberFormat;
(function (NumberFormat) {
    NumberFormat["language"] = "language";
    NumberFormat["system"] = "system";
    NumberFormat["comma_decimal"] = "comma_decimal";
    NumberFormat["decimal_comma"] = "decimal_comma";
    NumberFormat["space_comma"] = "space_comma";
    NumberFormat["none"] = "none";
})(NumberFormat || (NumberFormat = {}));
var TimeFormat;
(function (TimeFormat) {
    TimeFormat["language"] = "language";
    TimeFormat["system"] = "system";
    TimeFormat["am_pm"] = "12";
    TimeFormat["twenty_four"] = "24";
})(TimeFormat || (TimeFormat = {}));

// REF: https://github.com/home-assistant/frontend/blob/dev/src/common/datetime/use_am_pm.ts
/**
 * Checking if AM/PM time format is used within the browser.
 * @param locale Homeassistant frontend locale data
 * @returns
 */
const useAmPm = (locale) => {
    if (locale.time_format === TimeFormat.language ||
        locale.time_format === TimeFormat.system) {
        const testLanguage = locale.time_format === TimeFormat.language ? locale.language : undefined;
        const test = new Date().toLocaleString(testLanguage);
        return test.includes("AM") || test.includes("PM");
    }
    return locale.time_format === TimeFormat.am_pm;
};

//REF: https://github.com/home-assistant/frontend/blob/dev/src/common/datetime/format_time.ts
/**
 * 9:15 PM or 21:15
 * @param dateObj The time to convert
 * @param locale  The users's locale settings
 * @returns Reformated time in hh:mm
 */
const formatTime = (dateObj, locale) => formatTimeMem(locale).format(dateObj);
const formatTimeMem = (locale) => new Intl.DateTimeFormat(locale.language, {
    hour: "numeric",
    minute: "2-digit",
    hour12: useAmPm(locale),
});
/** States that we consider "off". */
const STATES_OFF = ["closed", "locked", "off"];

// Polymer legacy event helpers used courtesy of the Polymer project.
//
// Copyright (c) 2017 The Polymer Authors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//    * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
//    * Neither the name of Google Inc. nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
/**
 * Dispatches a custom event with an optional detail value.
 *
 * @param {string} type Name of event type.
 * @param {*=} detail Detail value containing event-specific
 *   payload.
 * @param {{ bubbles: (boolean|undefined),
 *           cancelable: (boolean|undefined),
 *           composed: (boolean|undefined) }=}
 *  options Object specifying options.  These may include:
 *  `bubbles` (boolean, defaults to `true`),
 *  `cancelable` (boolean, defaults to false), and
 *  `node` on which to fire the event (HTMLElement, defaults to `this`).
 * @return {Event} The new event that was fired.
 */
const fireEvent = (node, type, detail, options) => {
    options = options || {};
    // @ts-ignore
    detail = detail === null || detail === undefined ? {} : detail;
    const event = new Event(type, {
        bubbles: options.bubbles === undefined ? true : options.bubbles,
        cancelable: Boolean(options.cancelable),
        composed: options.composed === undefined ? true : options.composed
    });
    event.detail = detail;
    node.dispatchEvent(event);
    return event;
};

const compareArrayBufferViews = (a, b) => {
    if (a.byteLength !== b.byteLength) {
        return false;
    }
    const viewA = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
    const viewB = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
    for (let index = 0; index < viewA.length; index++) {
        if (viewA[index] !== viewB[index]) {
            return false;
        }
    }
    return true;
};
const deepEqual = (a, b) => {
    if (a === b) {
        return true;
    }
    if (a && b && typeof a === "object" && typeof b === "object") {
        if (a.constructor !== b.constructor) {
            return false;
        }
        let i;
        let length;
        if (Array.isArray(a)) {
            const bArray = b;
            length = a.length;
            if (length !== bArray.length) {
                return false;
            }
            for (i = length; i-- !== 0;) {
                if (!deepEqual(a[i], bArray[i])) {
                    return false;
                }
            }
            return true;
        }
        if (a instanceof Map && b instanceof Map) {
            if (a.size !== b.size) {
                return false;
            }
            for (i of a.entries()) {
                if (!b.has(i[0])) {
                    return false;
                }
            }
            for (i of a.entries()) {
                if (!deepEqual(i[1], b.get(i[0]))) {
                    return false;
                }
            }
            return true;
        }
        if (a instanceof Set && b instanceof Set) {
            if (a.size !== b.size) {
                return false;
            }
            for (i of a.entries()) {
                if (!b.has(i[0])) {
                    return false;
                }
            }
            return true;
        }
        if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
            return compareArrayBufferViews(a, b);
        }
        if (a instanceof RegExp && b instanceof RegExp) {
            return a.source === b.source && a.flags === b.flags;
        }
        if (a.valueOf !== Object.prototype.valueOf) {
            return a.valueOf() === b.valueOf();
        }
        if (a.toString !== Object.prototype.toString) {
            return a.toString() === b.toString();
        }
        const aRecord = a;
        const bRecord = b;
        const keys = Object.keys(aRecord);
        length = keys.length;
        if (length !== Object.keys(bRecord).length) {
            return false;
        }
        for (i = length; i-- !== 0;) {
            if (!Object.prototype.hasOwnProperty.call(b, keys[i])) {
                return false;
            }
        }
        for (i = length; i-- !== 0;) {
            const key = keys[i];
            if (!deepEqual(aRecord[key], bRecord[key])) {
                return false;
            }
        }
        return true;
    }
    return a !== a && b !== b;
};

const forwardHaptic = (hapticType) => {
    fireEvent(window, "haptic", hapticType);
};

const navigate = (_node, path, replace = false) => {
    if (replace) {
        history.replaceState(null, "", path);
    }
    else {
        history.pushState(null, "", path);
    }
    fireEvent(window, "location-changed", {
        replace
    });
};

const turnOnOffEntity = (hass, entityId, turnOn = true) => {
    const stateDomain = computeDomain(entityId);
    const serviceDomain = stateDomain === "group" ? "homeassistant" : stateDomain;
    let service;
    switch (stateDomain) {
        case "lock":
            service = turnOn ? "unlock" : "lock";
            break;
        case "cover":
            service = turnOn ? "open_cover" : "close_cover";
            break;
        default:
            service = turnOn ? "turn_on" : "turn_off";
    }
    return hass.callService(serviceDomain, service, { entity_id: entityId });
};

const toggleEntity = (hass, entityId) => {
    const turnOn = STATES_OFF.includes(hass.states[entityId].state);
    return turnOnOffEntity(hass, entityId, turnOn);
};

const handleActionConfig = (node, hass, config, actionConfig) => {
    if (!actionConfig) {
        actionConfig = {
            action: "more-info",
        };
    }
    if (actionConfig.confirmation &&
        (!actionConfig.confirmation.exemptions ||
            !actionConfig.confirmation.exemptions.some((e) => e.user === hass.user.id))) {
        forwardHaptic("warning");
        if (!confirm(actionConfig.confirmation.text ||
            `Are you sure you want to ${actionConfig.action}?`)) {
            return;
        }
    }
    switch (actionConfig.action) {
        case "more-info":
            if (config.entity || config.camera_image) {
                fireEvent(node, "hass-more-info", {
                    entityId: config.entity ? config.entity : config.camera_image,
                });
            }
            break;
        case "navigate":
            if (actionConfig.navigation_path) {
                navigate(node, actionConfig.navigation_path);
            }
            break;
        case "url":
            if (actionConfig.url_path) {
                window.open(actionConfig.url_path);
            }
            break;
        case "toggle":
            if (config.entity) {
                toggleEntity(hass, config.entity);
                forwardHaptic("success");
            }
            break;
        case "call-service": {
            if (!actionConfig.service) {
                forwardHaptic("failure");
                return;
            }
            const [domain, service] = actionConfig.service.split(".", 2);
            hass.callService(domain, service, actionConfig.service_data, actionConfig.target);
            forwardHaptic("success");
            break;
        }
        case "fire-dom-event": {
            fireEvent(node, "ll-custom", actionConfig);
        }
    }
};
const handleAction = (node, hass, config, action) => {
    let actionConfig;
    if (action === "double_tap" && config.double_tap_action) {
        actionConfig = config.double_tap_action;
    }
    else if (action === "hold" && config.hold_action) {
        actionConfig = config.hold_action;
    }
    else if (action === "tap" && config.tap_action) {
        actionConfig = config.tap_action;
    }
    handleActionConfig(node, hass, config, actionConfig);
};

function hasAction(config) {
    return config !== undefined && config.action !== "none";
}

// Check if config or Entity changed
function hasDoubleClick(config) {
    return config !== undefined && config.action !== "none";
}

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$3=globalThis,e$3=t$3.ShadowRoot&&(void 0===t$3.ShadyCSS||t$3.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$5=new WeakMap;let n$4 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$3&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$5.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$5.set(s,t));}return t}toString(){return this.cssText}};const r$4=t=>new n$4("string"==typeof t?t:t+"",void 0,s$2),i$5=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$4(o,t,s$2)},S$1=(s,o)=>{if(e$3)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$3.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$3?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$4,defineProperty:e$2,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$3,getOwnPropertySymbols:o$4,getPrototypeOf:n$3}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$4(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$2(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$3(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$3(t),...o$4(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,i$3=t=>t,s$1=t$2.trustedTypes,e$1=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$3=`lit$${Math.random().toFixed(9).slice(2)}$`,n$2="?"+o$3,r$2=`<${n$2}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e$1?e$1.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r$2:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$3+x):s+o$3+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$3),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$3)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$3),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n$2)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$3,t+1));)d.push({type:7,index:l}),t+=o$3.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$3(t).nextSibling;i$3(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t$2.litHtmlPolyfillSupport;B?.(S,k),(t$2.litHtmlVersions??=[]).push("3.3.3");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;let i$2 = class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}};i$2._$litElement$=true,i$2["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i$2});const o$2=s.litElementPolyfillSupport;o$2?.({LitElement:i$2});(s.litElementVersions??=[]).push("4.2.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=t=>(e,o)=>{ void 0!==o?o.addInitializer(()=>{customElements.define(t,e);}):customElements.define(t,e);};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o$1={attribute:true,type:String,converter:u$1,reflect:false,hasChanged:f$1},r$1=(t=o$1,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=true),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t,true,r);},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t,true,r);}}throw Error("Unsupported decorator location: "+n)};function n$1(t){return (e,o)=>"object"==typeof o?r$1(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function r(r){return n$1({...r,state:true,attribute:false})}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t={ATTRIBUTE:1},e=t=>(...e)=>({_$litDirective$:t,values:e});let i$1 = class i{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i;}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};

const isTouch = 'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    ('msMaxTouchPoints' in navigator &&
        navigator.msMaxTouchPoints >
            0);
const DOCUMENT_CANCEL_EVENTS = [
    'touchcancel',
    'mouseout',
    'mouseup',
    'touchmove',
    'mousewheel',
    'wheel',
    'scroll',
];
let documentListenersAttached = false;
let activeActionHandler = null;
function attachDocumentListeners() {
    if (documentListenersAttached)
        return;
    documentListenersAttached = true;
    const handleDocumentEvent = () => {
        const actionHandler = activeActionHandler;
        if (!actionHandler)
            return;
        actionHandler.cancelled = true;
        if (actionHandler.timer) {
            actionHandler.stopAnimation();
            clearTimeout(actionHandler.timer);
            actionHandler.timer = undefined;
            if (actionHandler.isRepeating && actionHandler.repeatTimeout) {
                window.clearInterval(actionHandler.repeatTimeout);
                actionHandler.isRepeating = false;
            }
        }
    };
    for (const eventName of DOCUMENT_CANCEL_EVENTS) {
        document.addEventListener(eventName, handleDocumentEvent, {
            passive: true,
        });
    }
}
function setupActionHandlerMethods(element) {
    const actionHandler = element;
    actionHandler.startAnimation = (x, y) => {
        Object.assign(actionHandler.style, {
            left: `${x}px`,
            top: `${y}px`,
            transform: 'translate(-50%, -50%) scale(1)',
        });
    };
    actionHandler.stopAnimation = () => {
        Object.assign(actionHandler.style, {
            left: '',
            top: '',
            transform: 'translate(-50%, -50%) scale(0)',
        });
    };
    actionHandler.bind = (element, options = {}) => {
        if (element.actionHandler &&
            deepEqual(options, element.actionHandler.options)) {
            return;
        }
        const previous = element.actionHandler;
        if (previous) {
            const { start, end, handleKeyDown, handleTouchMove } = previous;
            if (start) {
                element.removeEventListener('touchstart', start);
                element.removeEventListener('mousedown', start);
            }
            if (end) {
                element.removeEventListener('touchend', end);
                element.removeEventListener('touchcancel', end);
                element.removeEventListener('click', end);
            }
            if (handleKeyDown) {
                element.removeEventListener('keydown', handleKeyDown);
            }
            if (handleTouchMove) {
                element.removeEventListener('touchmove', handleTouchMove);
            }
        }
        else {
            element.addEventListener('contextmenu', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                return false;
            });
        }
        element.actionHandler = { options };
        if (options.disabled)
            return;
        element.actionHandler.start = (ev) => {
            if (ev.detail?.ignore)
                return;
            actionHandler.cancelled = false;
            actionHandler.held = false;
            let x = 0;
            let y = 0;
            if (ev.touches) {
                x = ev.touches[0].clientX;
                y = ev.touches[0].clientY;
            }
            else {
                x = ev.clientX;
                y = ev.clientY;
            }
            if (options.hasHold) {
                actionHandler.timer = window.setTimeout(() => {
                    actionHandler.startAnimation(x, y);
                    actionHandler.held = true;
                    fireEvent(element, 'action', { action: 'hold' });
                    if (options.repeat && options.repeat > 0) {
                        let repeatCount = 0;
                        actionHandler.isRepeating = true;
                        actionHandler.repeatTimeout = window.setInterval(() => {
                            repeatCount++;
                            fireEvent(element, 'action', { action: 'hold' });
                            if (options.repeatLimit && repeatCount >= options.repeatLimit) {
                                const repeatTimeout = actionHandler.repeatTimeout;
                                if (repeatTimeout) {
                                    window.clearInterval(repeatTimeout);
                                }
                                actionHandler.isRepeating = false;
                            }
                        }, options.repeat);
                    }
                }, actionHandler.holdTime);
            }
        };
        element.actionHandler.end = (ev) => {
            if (ev.detail?.ignore)
                return;
            if (['touchend', 'touchcancel'].includes(ev.type) &&
                actionHandler.cancelled) {
                if (actionHandler.isRepeating && actionHandler.repeatTimeout) {
                    window.clearInterval(actionHandler.repeatTimeout);
                    actionHandler.isRepeating = false;
                }
                return;
            }
            if (ev.type === 'touchcancel')
                return;
            if (['touchend', 'touchcancel', 'mouseup'].includes(ev.type)) {
                actionHandler.stopAnimation();
            }
            if (actionHandler.isRepeating && actionHandler.repeatTimeout) {
                window.clearInterval(actionHandler.repeatTimeout);
                actionHandler.isRepeating = false;
            }
            if (actionHandler.timer) {
                clearTimeout(actionHandler.timer);
                actionHandler.timer = undefined;
            }
            if (actionHandler.held)
                return;
            if (options.hasDoubleClick) {
                if ((ev.type === 'click' && ev.detail < 2) ||
                    !actionHandler.dblClickTimeout) {
                    actionHandler.dblClickTimeout = window.setTimeout(() => {
                        actionHandler.dblClickTimeout = undefined;
                        fireEvent(element, 'action', { action: 'tap' });
                    }, 250);
                }
                else {
                    clearTimeout(actionHandler.dblClickTimeout);
                    actionHandler.dblClickTimeout = undefined;
                    fireEvent(element, 'action', { action: 'double_tap' });
                }
            }
            else {
                fireEvent(element, 'action', { action: 'tap' });
            }
        };
        const handleTouchMove = (ev) => {
            const touch = ev.touches[0];
            if (!touch)
                return;
            const rect = element.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) {
                actionHandler.cancelled = true;
            }
        };
        element.actionHandler.handleTouchMove = handleTouchMove;
        const { start, end } = element.actionHandler;
        if (start) {
            element.addEventListener('touchstart', start, { passive: true });
            element.addEventListener('mousedown', start, { passive: true });
        }
        if (end) {
            element.addEventListener('touchend', end);
            element.addEventListener('touchcancel', end);
            element.addEventListener('click', end);
        }
        element.addEventListener('touchmove', handleTouchMove, { passive: true });
        if (!options.disableKbd) {
            const handleKeyDown = (ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    element.click();
                }
            };
            element.actionHandler.handleKeyDown = handleKeyDown;
            element.addEventListener('keydown', handleKeyDown);
        }
    };
    attachDocumentListeners();
    return actionHandler;
}
function getActionHandler() {
    const existing = document.body.querySelector('.action-handler-hypnogram-card');
    if (existing) {
        activeActionHandler = existing;
        return activeActionHandler;
    }
    const div = document.createElement('div');
    div.className = 'action-handler-hypnogram-card';
    Object.assign(div.style, {
        position: 'absolute',
        width: isTouch ? '100px' : '50px',
        height: isTouch ? '100px' : '50px',
        transform: 'translate(-50%, -50%) scale(0)',
        pointerEvents: 'none',
        zIndex: '999',
        transition: 'transform 0.1s ease-out',
        borderRadius: '50%',
        background: 'rgba(var(--rgb-primary-color), 0.3)',
    });
    const actionHandler = div;
    actionHandler.holdTime = 500;
    actionHandler.cancelled = false;
    actionHandler.held = false;
    actionHandler.isRepeating = false;
    document.body.appendChild(div);
    activeActionHandler = setupActionHandlerMethods(div);
    return activeActionHandler;
}
function actionHandlerBind(element, options) {
    getActionHandler().bind(element, options);
}
class ActionHandlerDirective extends i$1 {
    render(_options) {
        return undefined;
    }
    update(part, [options]) {
        if (!deepEqual(options, this.previousOptions)) {
            actionHandlerBind(part.element, options);
            this.previousOptions = options ? { ...options } : undefined;
        }
        return this.render(options);
    }
}
const actionHandler = e(ActionHandlerDirective);

/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const n="important",i=" !"+n,o=e(class extends i$1{constructor(t$1){if(super(t$1),t$1.type!==t.ATTRIBUTE||"style"!==t$1.name||t$1.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce((e,r)=>{const s=t[r];return null==s?e:e+`${r=r.includes("-")?r:r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(e,[r]){const{style:s}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(r)),this.render(r);for(const t of this.ft)null==r[t]&&(this.ft.delete(t),t.includes("-")?s.removeProperty(t):s[t]=null);for(const t in r){const e=r[t];if(null!=e){this.ft.add(t);const r="string"==typeof e&&e.endsWith(i);t.includes("-")||r?s.setProperty(t,r?e.slice(0,-11):e,r?n:""):s[t]=e;}}return E}});

const CARD_NAME = 'HYPNOGRAM-CARD';
const CARD_VERSION = '0.0.1';
const SLEEP_AS_ANDROID = {
    phaseLevels: {
        awake: 4,
        rem: 3,
        light_sleep: 2,
        deep_sleep: 1,
    },
    stateMapping: {
        deep_sleep: 'deep_sleep',
        light_sleep: 'light_sleep',
        rem: 'rem',
        awake: 'awake',
    },
    tracking: {
        started: 'sleep_tracking_started',
        stopped: 'sleep_tracking_stopped',
    },
};
const PHASE_LEVELS = {
    ...SLEEP_AS_ANDROID.phaseLevels,
};
const DEFAULT_STATE_MAPPING = {
    ...SLEEP_AS_ANDROID.stateMapping,
};
const CHART_CONFIG = {
    height: 168,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    bucketMinutes: 30,
    bucketMinutesMin: 1,
    bucketMinutesMax: 30,
};
function clampBucketMinutes(value) {
    const minutes = value ?? CHART_CONFIG.bucketMinutes;
    return Math.min(CHART_CONFIG.bucketMinutesMax, Math.max(CHART_CONFIG.bucketMinutesMin, minutes));
}

var en = {
    // Card
    'card.title': 'Today',
    'card.loading': 'Loading sleep data...',
    'card.no_data': 'No sleep data available',
    'card.error_entity_not_found': 'Entity not found',
    'card.label.awake': 'Awake',
    'card.label.rem': 'REM',
    'card.label.light_sleep': 'Light sleep',
    'card.label.deep_sleep': 'Deep sleep',
    // Editor
    'editor.title_label': 'Title',
    'editor.show_title_label': 'Show title',
    'editor.show_legends_label': 'Show legends',
    'editor.legend_position_label': 'Legend position',
    'editor.legend_position.left': 'Left',
    'editor.legend_position.right': 'Right',
    'editor.display_options_label': 'Display options',
    'editor.show_period_range_label': 'Show time range',
    'editor.entity_label': 'Sleep Data Entity (Required)',
    'editor.primary_color_label': 'Chart color',
    'editor.primary_color_helper': 'Hex, RGB or CSS variables. Bars will be based on this color.',
    'editor.chart_configuration_label': 'Chart configuration',
    'editor.bucket_minutes_label': 'Bucket size (minutes)',
    'editor.bucket_minutes_helper': 'Groups short phase changes into time buckets. Higher values smooth the chart. Can be set to 1-30 minutes.',
    'editor.tap_action_label': 'Tap action',
    'editor.hold_action_label': 'Hold action',
    'editor.double_tap_action_label': 'Double tap action',
    'editor.interaction_label': 'Interaction',
    'editor.state_mapping_label': 'State mapping',
    'editor.state_mapping_helper': 'Entity state values for each sleep phase. Defaults match Sleep as Android.',
    'editor.state_mapping.deep_sleep': 'Deep sleep entity state',
    'editor.state_mapping.light_sleep': 'Light sleep entity state',
    'editor.state_mapping.rem': 'REM entity state',
    'editor.state_mapping.awake': 'Awake entity state',
};

var sv = {
    // Card
    'card.title': 'Idag',
    'card.loading': 'Laddar sömndata...',
    'card.no_data': 'Ingen sömndata tillgänglig',
    'card.error_entity_not_found': 'Hittade inte entiteten',
    'card.label.awake': 'Vaken',
    'card.label.rem': 'REM',
    'card.label.light_sleep': 'Lätt sömn',
    'card.label.deep_sleep': 'Djupsömn',
    // Editor
    'editor.title_label': 'Titel',
    'editor.show_title_label': 'Visa titel',
    'editor.show_legends_label': 'Visa legender',
    'editor.legend_position_label': 'Legendposition',
    'editor.legend_position.left': 'Vänster',
    'editor.legend_position.right': 'Höger',
    'editor.display_options_label': 'Visningsalternativ',
    'editor.show_period_range_label': 'Visa tidsintervall',
    'editor.entity_label': 'Sömndata Entitet (Krav)',
    'editor.primary_color_label': 'Diagramfärg',
    'editor.primary_color_helper': 'Hex, RGB eller CSS-variabler. Färgerna på staplarna baseras på denna färg.',
    'editor.chart_configuration_label': 'Diagramkonfiguration',
    'editor.bucket_minutes_label': 'Bucket-storlek (minuter)',
    'editor.bucket_minutes_helper': 'Grupperar korta fasändringar i tidsintervall. Högre värden jämnar ut diagrammet. Kan sättas till 1-30 minuter.',
    'editor.tap_action_label': 'Tryckåtgärd',
    'editor.hold_action_label': 'Håll åtgärd',
    'editor.double_tap_action_label': 'Dubbeltrycksåtgärd',
    'editor.interaction_label': 'Interaktion',
    'editor.state_mapping_label': 'Tillståndsmappning',
    'editor.state_mapping_helper': 'Entitetstillstånd för varje sömnfas. Standardvärden matchar Sleep as Android.',
    'editor.state_mapping.deep_sleep': 'Djupsömn entitetstillstånd',
    'editor.state_mapping.light_sleep': 'Lätt sömn entitetstillstånd',
    'editor.state_mapping.rem': 'REM entitetstillstånd',
    'editor.state_mapping.awake': 'Vaken entitetstillstånd',
};

const languages$1 = {
    en,
    sv,
};
function localize$1(string, hass) {
    const lang = hass?.locale?.language || hass?.language || 'en';
    try {
        return languages$1[lang]?.[string] || languages$1.en[string] || string;
    }
    catch {
        return languages$1.en[string] || string;
    }
}

const PHASE_ORDER = ['deep_sleep', 'light_sleep', 'rem', 'awake'];
const DEFAULT_DERIVE_HUE = 195 / 360;
const DEFAULT_DERIVE_SATURATION = 0.78;
const DEFAULT_DERIVATION_LIGHTNESS = 0.63;
const DEFAULT_PRIMARY_COLOR = 'var(--primary-color)';
const LIGHT_MODE_THRESHOLD = 0.72;
const DARK_MODE_THRESHOLD = 0.22;
// Phase color tuning (HSL offsets from the configured primary color).
// rem is the anchor in normal mode; other phases shift lighter/darker around it.
//
// NORMAL_* — used when the primary color is mid-range (between the thresholds).
//   LIGHTNESS: negative = darker, positive = lighter. Smaller numbers = subtler steps.
//   SATURATION: 1 = unchanged; lower values mute that phase toward gray.
//
// LIGHT_MODE_DARKEN — primary is very light (>= LIGHT_MODE_THRESHOLD).
//   rem keeps the primary; lower phases darken by these amounts; awake lightens slightly.
//
// DARK_MODE_LIGHTEN — primary is very dark (<= DARK_MODE_THRESHOLD).
//   deep_sleep keeps the primary; higher phases lighten by these amounts.
const NORMAL_LIGHTNESS_OFFSET = {
    deep_sleep: -0.15,
    light_sleep: -0.08,
    rem: 0,
    awake: 0.12,
};
const NORMAL_SATURATION_SCALE = {
    deep_sleep: 0.88,
    light_sleep: 0.92,
    rem: 0.98,
    awake: 1,
};
const LIGHT_MODE_DARKEN = {
    deep_sleep: 0.17,
    light_sleep: 0.09,
    rem: 0,
    awake: 0.04,
};
const DARK_MODE_LIGHTEN = {
    deep_sleep: 0,
    light_sleep: 0.1,
    rem: 0.17,
    awake: 0.24,
};
function parseHexColor(input) {
    const normalized = input.trim().toLowerCase();
    const match = normalized.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
    if (!match)
        return null;
    let hex = match[1];
    if (hex.length === 3) {
        hex = [...hex].map((char) => char + char).join('');
    }
    return {
        r: Number.parseInt(hex.slice(0, 2), 16),
        g: Number.parseInt(hex.slice(2, 4), 16),
        b: Number.parseInt(hex.slice(4, 6), 16),
    };
}
function channelToByte(value, isPercent) {
    const parsed = Number.parseFloat(value);
    const scaled = isPercent ? (parsed / 100) * 255 : parsed;
    return Math.min(255, Math.max(0, Math.round(scaled)));
}
function parseRgbColor(input) {
    const trimmed = input.trim();
    const hex = parseHexColor(trimmed);
    if (hex)
        return hex;
    const match = trimmed.match(/^rgba?\(\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*,\s*([\d.]+%?)/i);
    if (!match)
        return null;
    const toChannel = (value) => channelToByte(value, value.trim().endsWith('%'));
    return {
        r: toChannel(match[1]),
        g: toChannel(match[2]),
        b: toChannel(match[3]),
    };
}
function rgbToHex({ r, g, b }) {
    return `#${[r, g, b]
        .map((channel) => channel.toString(16).padStart(2, '0'))
        .join('')}`;
}
function rgbToHsl({ r, g, b }) {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;
    const lightness = (max + min) / 2;
    if (delta === 0) {
        return { h: 0, s: 0, l: lightness };
    }
    const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    let hue = 0;
    switch (max) {
        case rn:
            hue = ((gn - bn) / delta + (gn < bn ? 6 : 0)) / 6;
            break;
        case gn:
            hue = ((bn - rn) / delta + 2) / 6;
            break;
        default:
            hue = ((rn - gn) / delta + 4) / 6;
            break;
    }
    return { h: hue, s: saturation, l: lightness };
}
function hslToHex({ h, s, l }) {
    const hue = ((h % 1) + 1) % 1;
    const saturation = Math.min(1, Math.max(0, s));
    const lightness = Math.min(1, Math.max(0, l));
    if (saturation === 0) {
        const channel = Math.round(lightness * 255);
        return `#${channel.toString(16).padStart(2, '0').repeat(3)}`;
    }
    const q = lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;
    const toChannel = (t) => {
        const tone = ((t % 1) + 1) % 1;
        if (tone < 1 / 6)
            return p + (q - p) * 6 * tone;
        if (tone < 1 / 2)
            return q;
        if (tone < 2 / 3)
            return p + (q - p) * (2 / 3 - tone) * 6;
        return p;
    };
    const r = Math.round(toChannel(hue + 1 / 3) * 255);
    const g = Math.round(toChannel(hue) * 255);
    const b = Math.round(toChannel(hue - 1 / 3) * 255);
    return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}
function normalizePrimaryColor(color) {
    if (!color)
        return undefined;
    if (typeof color === 'string') {
        const trimmed = color.trim();
        return trimmed || undefined;
    }
    if (Array.isArray(color) && color.length >= 3) {
        const [r, g, b] = color;
        return rgbToHex({
            r: Math.round(r),
            g: Math.round(g),
            b: Math.round(b),
        });
    }
    return undefined;
}
function resolveCssColor(color, context) {
    if (typeof window === 'undefined')
        return null;
    const probe = document.createElement('span');
    probe.style.display = 'none';
    probe.style.color = color;
    const mount = /var\s*\(/i.test(color) || !context?.isConnected
        ? document.documentElement
        : context;
    mount.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    mount.removeChild(probe);
    return resolved && resolved !== 'rgba(0, 0, 0, 0)' ? resolved : null;
}
function resolvePrimaryColor(color, context) {
    const source = normalizePrimaryColor(color);
    if (!source)
        return { source: '', rgb: null };
    const direct = parseRgbColor(source);
    if (direct)
        return { source, rgb: direct };
    const resolved = resolveCssColor(source, context);
    if (resolved) {
        const rgb = parseRgbColor(resolved);
        if (rgb)
            return { source, rgb };
    }
    return { source, rgb: null };
}
function defaultDerivationRgb() {
    return (parseHexColor(hslToHex({
        h: DEFAULT_DERIVE_HUE,
        s: DEFAULT_DERIVE_SATURATION,
        l: DEFAULT_DERIVATION_LIGHTNESS,
    })) ?? { r: 69, g: 212, b: 255 });
}
function resolveHueAndSaturation(hsl) {
    if (hsl.s < 0.08) {
        return { h: DEFAULT_DERIVE_HUE, s: DEFAULT_DERIVE_SATURATION };
    }
    return { h: hsl.h, s: hsl.s };
}
function clampLightness(value) {
    return Math.min(0.92, Math.max(0.12, value));
}
function phaseFromHsl(h, s, l, saturationScale = 1) {
    return hslToHex({
        h,
        s: Math.min(1, s * saturationScale),
        l: clampLightness(l),
    });
}
function deriveNormalPalette(h, s, baseLightness) {
    const colors = {};
    for (const phase of PHASE_ORDER) {
        colors[phase] = phaseFromHsl(h, s, baseLightness + NORMAL_LIGHTNESS_OFFSET[phase], NORMAL_SATURATION_SCALE[phase]);
    }
    return colors;
}
function deriveLightPalette(h, s, remLightness) {
    const colors = {};
    for (const phase of PHASE_ORDER) {
        if (phase === 'awake') {
            colors.awake = phaseFromHsl(h, s, Math.min(0.95, remLightness + LIGHT_MODE_DARKEN.awake), NORMAL_SATURATION_SCALE.awake);
            continue;
        }
        const target = Math.max(0.12, remLightness - LIGHT_MODE_DARKEN[phase]);
        colors[phase] = phaseFromHsl(h, s, target, NORMAL_SATURATION_SCALE[phase]);
    }
    return colors;
}
function deriveDarkPalette(h, s, deepLightness) {
    const colors = {};
    for (const phase of PHASE_ORDER) {
        const target = Math.min(0.92, deepLightness +
            DARK_MODE_LIGHTEN[phase]);
        colors[phase] = phaseFromHsl(h, s, target, NORMAL_SATURATION_SCALE[phase]);
    }
    return colors;
}
function derivePhaseColors(rgb) {
    const derivationRgb = rgb ?? defaultDerivationRgb();
    const hsl = rgbToHsl(derivationRgb);
    const { h, s } = resolveHueAndSaturation(hsl);
    if (hsl.l >= LIGHT_MODE_THRESHOLD) {
        return deriveLightPalette(h, s, hsl.l);
    }
    if (hsl.l <= DARK_MODE_THRESHOLD) {
        return deriveDarkPalette(h, s, hsl.l);
    }
    return deriveNormalPalette(h, s, hsl.l);
}

function buildChartPalette(primaryColor = DEFAULT_PRIMARY_COLOR, context) {
    const { rgb } = resolvePrimaryColor(primaryColor, context);
    const phaseColors = derivePhaseColors(rgb);
    return { phaseColors };
}
const cardStyles = i$5 `
  :host {
    display: block;
    height: 100%;
    min-height: 220px;
  }
  .card {
    background: var(
      --ha-card-background,
      var(--card-background-color, #1a1a1a)
    );
    border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg, 16px));
    border: var(--ha-card-border-width, 1px) solid
      var(--ha-card-border-color, var(--divider-color, #2a2a2a));
    box-shadow: var(--ha-card-box-shadow, none);
    padding: 16px 16px 12px;
    height: 100%;
    min-height: 220px;
    box-sizing: border-box;
    color: var(--primary-text-color, #f0f0f0);
  }
  .card.interactive {
    cursor: pointer;
  }
  .card.interactive:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
  .header-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }
  .header {
    font-weight: 600;
    font-size: var(--ha-font-size-l);
    color: var(--primary-text-color, #f0f0f0);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
  }
  .period-range {
    font-size: var(--ha-font-size-s);
    font-weight: 400;
    color: var(--secondary-text-color, #9a9a9a);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .header.is-hidden,
  .period-range.is-hidden {
    visibility: hidden;
  }
  .chart-area {
    position: relative;
    min-height: 168px;
  }
  .chart-container.has-legends {
    display: flex;
    align-items: stretch;
  }
  .chart-container.legend-left {
    flex-direction: row;
  }
  .chart-container.legend-right {
    flex-direction: row-reverse;
  }
  .legends {
    flex: 0 0 auto;
    width: 4.75rem;
    box-sizing: border-box;
    font-size: var(--ha-font-size-s);
    line-height: 1.2;
    color: var(--secondary-text-color, #9e9e9e);
    position: absolute;
    height: 100%;
    z-index: 1;
  }
  .chart-container.legend-left .legends {
    text-align: left;
  }
  .chart-container.legend-right .legends {
    text-align: right;
  }
  .legend {
    position: absolute;
    left: 2px;
    right: 2px;
    white-space: nowrap;
  }
  .legend.awake {
    top: 0;
  }
  .legend.rem {
    top: 25%;
  }
  .legend.light_sleep {
    top: 50%;
  }
  .legend.deep_sleep {
    top: 75%;
  }
  .error {
    color: var(--error-color);
    background-color: var(--error-warning-background-color, #ffcccc);
    padding: 16px;
    border-radius: 12px;
  }
  .loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.35);
    color: var(--secondary-text-color, #9e9e9e);
    font-size: 0.9em;
    border-radius: 8px;
  }
`;
const chartStyles = i$5 `
  .chart-container {
    box-sizing: border-box;
  }
  .plot {
    position: relative;
    flex: 1;
    min-width: 0;
    min-height: 0;
  }
  .chart-container:not(.has-legends) .plot {
    position: absolute;
    inset: 0;
  }
  .bar {
    box-sizing: border-box;
    pointer-events: none;
  }
  .awake-line {
    box-sizing: border-box;
    pointer-events: none;
    z-index: 2;
  }
  .empty-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--secondary-text-color, #9e9e9e);
    font-size: 0.9em;
    pointer-events: none;
    z-index: 3;
  }
`;

function getChartDimensions(width, height = CHART_CONFIG.height) {
    const padding = { ...CHART_CONFIG.padding };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const levelHeight = plotHeight / 4;
    const barHeight = levelHeight;
    return {
        width,
        height,
        padding,
        plotWidth,
        plotHeight,
        levelHeight,
        barHeight,
    };
}
function timeToX(timeMs, startMs, endMs, dims) {
    const duration = endMs - startMs;
    if (duration <= 0)
        return dims.padding.left;
    const ratio = (timeMs - startMs) / duration;
    return dims.padding.left + ratio * dims.plotWidth;
}
function levelToY(level, dims) {
    return dims.padding.top + (4 - level) * dims.levelHeight;
}
function buildCompressedLayout(segments) {
    const bars = [];
    const awakeLineMs = [];
    let compressed = 0;
    for (const segment of segments) {
        if (segment.state === 'awake') {
            awakeLineMs.push(compressed);
            continue;
        }
        const duration = segment.endMs - segment.startMs;
        if (duration <= 0)
            continue;
        bars.push({
            ...segment,
            layoutStartMs: compressed,
            layoutEndMs: compressed + duration,
        });
        compressed += duration;
    }
    return {
        bars,
        awakeLineMs,
        layoutStartMs: 0,
        layoutEndMs: compressed,
    };
}
function getLayoutSegmentRect(segment, layoutStartMs, layoutEndMs, dims) {
    const x = timeToX(segment.layoutStartMs, layoutStartMs, layoutEndMs, dims);
    const xEnd = timeToX(segment.layoutEndMs, layoutStartMs, layoutEndMs, dims);
    const plotBottom = dims.padding.top + dims.plotHeight;
    const levelTop = levelToY(segment.level, dims);
    return {
        x,
        y: levelTop,
        width: Math.max(xEnd - x, 1),
        height: plotBottom - levelTop,
    };
}
function getAwakeLineAtX(layoutMs, layoutStartMs, layoutEndMs, dims, lineWidthPx = 2) {
    const x = timeToX(layoutMs, layoutStartMs, layoutEndMs, dims);
    return {
        x,
        y: dims.padding.top,
        width: lineWidthPx,
        height: dims.plotHeight,
    };
}
function getAdjacentBarSegments(segments, index) {
    let prev;
    for (let i = index - 1; i >= 0; i--) {
        if (segments[i].state !== 'awake') {
            prev = segments[i];
            break;
        }
    }
    let next;
    for (let i = index + 1; i < segments.length; i++) {
        if (segments[i].state !== 'awake') {
            next = segments[i];
            break;
        }
    }
    return { prev, next };
}
function getBarStepRadii(segment, prev, next, radiusPx = 4) {
    const radius = `${radiusPx}px`;
    return {
        borderTopLeftRadius: prev && prev.level < segment.level ? radius : '0',
        borderTopRightRadius: next && next.level < segment.level ? radius : '0',
    };
}

function getPhaseColor(palette, state) {
    return (palette.phaseColors[state] ??
        palette.phaseColors.light_sleep);
}
function renderHypnogramChart(segments, hass, primaryColor, showLegends, legendPosition = 'left', context) {
    const palette = buildChartPalette(primaryColor, context);
    const dims = getChartDimensions(400, CHART_CONFIG.height);
    const layout = buildCompressedLayout(segments);
    const hasData = layout.layoutEndMs > 0 &&
        (layout.bars.length > 0 || layout.awakeLineMs.length > 0);
    const sleepBars = layout.bars.map((segment, index) => {
        const { prev, next } = getAdjacentBarSegments(layout.bars, index);
        const stepRadii = getBarStepRadii(segment, prev, next);
        const rect = getLayoutSegmentRect(segment, layout.layoutStartMs, layout.layoutEndMs, dims);
        const barStyle = {
            position: 'absolute',
            left: `${(rect.x / dims.width) * 100}%`,
            top: `${(rect.y / dims.height) * 100}%`,
            width: `${Math.max((rect.width / dims.width) * 100, 0.2)}%`,
            height: `${(rect.height / dims.height) * 100}%`,
            backgroundColor: getPhaseColor(palette, segment.state),
            ...stepRadii,
        };
        return b `<div class="bar" style=${o(barStyle)}></div>`;
    });
    const awakeLines = layout.awakeLineMs.map((layoutMs) => {
        const rect = getAwakeLineAtX(layoutMs, layout.layoutStartMs, layout.layoutEndMs, dims);
        const lineStyle = {
            position: 'absolute',
            left: `${(rect.x / dims.width) * 100}%`,
            top: `${(rect.y / dims.height) * 100}%`,
            width: '2px',
            height: `${(rect.height / dims.height) * 100}%`,
            backgroundColor: palette.phaseColors.awake,
        };
        return b `<div class="awake-line" style=${o(lineStyle)}></div>`;
    });
    const labels = [
        { key: 'deep_sleep', label: localize$1('card.label.deep_sleep', hass) },
        { key: 'rem', label: localize$1('card.label.rem', hass) },
        { key: 'awake', label: localize$1('card.label.awake', hass) },
        { key: 'light_sleep', label: localize$1('card.label.light_sleep', hass) },
    ];
    return b `
    <div
      class="chart-container${showLegends ? ` has-legends legend-${legendPosition}` : ''}"
      style=${o({
        position: 'relative',
        width: '100%',
        height: `${dims.height}px`,
        minHeight: `${dims.height}px`,
        borderRadius: '8px',
        overflow: 'hidden',
    })}
    >
      ${showLegends
        ? b `
          <div class="legends">
            ${labels.map((label) => b `
            <div class="legend ${label.key}">${label.label}</div>`)}
          </div>`
        : ''}

      <div class="plot">
        ${sleepBars}
        ${awakeLines}
      </div>
      ${hasData
        ? ''
        : b `
            <div class="empty-overlay">
              ${localize$1('card.no_data', hass)}
            </div>
          `}
    </div>
  `;
}

const STATE_MAPPING_PHASES = [
    'deep_sleep',
    'light_sleep',
    'rem',
    'awake',
];
let HypnogramCardEditor = class HypnogramCardEditor extends i$2 {
    setConfig(config) {
        this._config = {
            ...config,
            show_title: config.show_title ?? true,
            show_period_range: config.show_period_range ?? true,
            show_labels: config.show_labels ?? false,
            legend_position: config.legend_position ?? 'left',
            primary_color: config.primary_color ?? DEFAULT_PRIMARY_COLOR,
            bucket_minutes: clampBucketMinutes(config.bucket_minutes),
            tap_action: config.tap_action ?? { action: 'more-info' },
            hold_action: config.hold_action ?? { action: 'none' },
            double_tap_action: config.double_tap_action ?? { action: 'none' },
            state_mapping: {
                ...DEFAULT_STATE_MAPPING,
                ...config.state_mapping,
            },
        };
    }
    get _schema() {
        const entities = Object.keys(this.hass.states)
            .filter((eid) => eid.startsWith('sensor.'))
            .sort();
        return [
            {
                name: 'entity',
                required: true,
                selector: { entity: { include_entities: entities } },
            },
            {
                type: 'expandable',
                name: 'display_options',
                icon: 'mdi:eye-outline',
                flatten: true,
                schema: [
                    {
                        name: 'title',
                        selector: { text: {} },
                        disabled: !this._config.show_title,
                    },
                    {
                        name: 'show_title',
                        default: true,
                        selector: { boolean: {} },
                    },
                    {
                        name: 'show_period_range',
                        default: true,
                        selector: { boolean: {} },
                    },
                    {
                        name: 'show_labels',
                        default: false,
                        selector: { boolean: {} },
                    },
                    {
                        name: 'legend_position',
                        default: 'left',
                        disabled: !this._config.show_labels,
                        selector: {
                            select: {
                                mode: 'dropdown',
                                options: [
                                    {
                                        value: 'left',
                                        label: localize$1('editor.legend_position.left', this.hass),
                                    },
                                    {
                                        value: 'right',
                                        label: localize$1('editor.legend_position.right', this.hass),
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
            {
                type: 'expandable',
                name: 'state_mapping',
                icon: 'mdi:sleep',
                schema: STATE_MAPPING_PHASES.map((phase) => ({
                    name: phase,
                    required: true,
                    default: DEFAULT_STATE_MAPPING[phase],
                    selector: { text: {} },
                })),
            },
            {
                type: 'expandable',
                name: 'chart_configuration',
                icon: 'mdi:chart-line',
                flatten: true,
                schema: [
                    {
                        name: 'primary_color',
                        default: DEFAULT_PRIMARY_COLOR,
                        selector: { text: {} },
                    },
                    {
                        name: 'bucket_minutes',
                        default: CHART_CONFIG.bucketMinutes,
                        selector: {
                            number: {
                                min: CHART_CONFIG.bucketMinutesMin,
                                max: CHART_CONFIG.bucketMinutesMax,
                                step: 1,
                                mode: 'box',
                            },
                        },
                    },
                ],
            },
            {
                type: 'expandable',
                name: 'interaction',
                icon: 'mdi:gesture-tap',
                flatten: true,
                schema: [
                    {
                        name: 'tap_action',
                        default: { action: 'more-info' },
                        selector: { ui_action: { default_action: 'more-info' } },
                    },
                    {
                        name: 'hold_action',
                        default: { action: 'none' },
                        selector: { ui_action: {} },
                    },
                    {
                        name: 'double_tap_action',
                        default: { action: 'none' },
                        selector: { ui_action: {} },
                    },
                ],
            },
        ];
    }
    render() {
        if (!this.hass || !this._config) {
            return b ``;
        }
        const computeLabel = (schema) => {
            if (schema.name === 'title')
                return localize$1('editor.title_label', this.hass);
            if (schema.name === 'show_title')
                return localize$1('editor.show_title_label', this.hass);
            if (schema.name === 'show_period_range')
                return localize$1('editor.show_period_range_label', this.hass);
            if (schema.name === 'show_labels')
                return localize$1('editor.show_legends_label', this.hass);
            if (schema.name === 'legend_position')
                return localize$1('editor.legend_position_label', this.hass);
            if (schema.name === 'display_options')
                return localize$1('editor.display_options_label', this.hass);
            if (schema.name === 'entity')
                return localize$1('editor.entity_label', this.hass);
            if (schema.name === 'primary_color')
                return localize$1('editor.primary_color_label', this.hass);
            if (schema.name === 'bucket_minutes')
                return localize$1('editor.bucket_minutes_label', this.hass);
            if (schema.name === 'chart_configuration')
                return localize$1('editor.chart_configuration_label', this.hass);
            if (schema.name === 'tap_action')
                return localize$1('editor.tap_action_label', this.hass);
            if (schema.name === 'hold_action')
                return localize$1('editor.hold_action_label', this.hass);
            if (schema.name === 'double_tap_action')
                return localize$1('editor.double_tap_action_label', this.hass);
            if (schema.name === 'interaction')
                return localize$1('editor.interaction_label', this.hass);
            if (schema.name === 'state_mapping')
                return localize$1('editor.state_mapping_label', this.hass);
            if (schema.name &&
                STATE_MAPPING_PHASES.includes(schema.name)) {
                return localize$1(`editor.state_mapping.${schema.name}`, this.hass);
            }
            return schema.name ?? '';
        };
        const computeHelper = (schema) => {
            if (schema.name === 'primary_color')
                return localize$1('editor.primary_color_helper', this.hass);
            if (schema.name === 'bucket_minutes')
                return localize$1('editor.bucket_minutes_helper', this.hass);
            if (schema.name === 'state_mapping')
                return localize$1('editor.state_mapping_helper', this.hass);
            return undefined;
        };
        return b `
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this._schema}
        .computeLabel=${computeLabel}
        .computeHelper=${computeHelper}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
    }
    _valueChanged(ev) {
        const config = ev.detail.value;
        this._config = config;
        const event = new CustomEvent('config-changed', {
            detail: { config },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }
};
__decorate([
    n$1({ attribute: false })
], HypnogramCardEditor.prototype, "hass", void 0);
__decorate([
    r()
], HypnogramCardEditor.prototype, "_config", void 0);
HypnogramCardEditor = __decorate([
    t$1('hypnogram-card-editor')
], HypnogramCardEditor);

function reverseStateMapping(stateMapping) {
    const reverse = {};
    for (const [phase, entityState] of Object.entries(stateMapping)) {
        reverse[entityState] = phase;
    }
    return reverse;
}
function normalizeHistoryState(entry, reverseMapping) {
    const rawState = entry.s ?? entry.state;
    if (!rawState)
        return null;
    const seconds = entry.lc ??
        entry.lu ??
        (entry.last_changed
            ? new Date(entry.last_changed).getTime() / 1000
            : undefined);
    if (seconds === undefined)
        return null;
    return {
        state: reverseMapping[rawState] ?? rawState,
        timestamp: new Date(seconds * 1000),
    };
}
function isPhaseState(state) {
    return state in PHASE_LEVELS;
}
function findSleepWindow(sortedPoints) {
    let startIndex = -1;
    for (let i = sortedPoints.length - 1; i >= 0; i--) {
        if (sortedPoints[i].state === SLEEP_AS_ANDROID.tracking.started) {
            startIndex = i;
            break;
        }
    }
    if (startIndex === -1) {
        const firstPhaseIndex = sortedPoints.findIndex((p) => isPhaseState(p.state));
        if (firstPhaseIndex === -1) {
            return { startIndex: 0, stopIndex: sortedPoints.length - 1 };
        }
        const lastStopBeforePhases = sortedPoints
            .slice(0, firstPhaseIndex)
            .map((p) => p.state)
            .lastIndexOf(SLEEP_AS_ANDROID.tracking.stopped);
        if (lastStopBeforePhases !== -1) {
            return {
                startIndex: lastStopBeforePhases + 1,
                stopIndex: sortedPoints.length - 1,
            };
        }
        return { startIndex: firstPhaseIndex, stopIndex: sortedPoints.length - 1 };
    }
    let stopIndex = sortedPoints.findIndex((p, i) => i > startIndex && p.state === SLEEP_AS_ANDROID.tracking.stopped);
    if (stopIndex === -1)
        stopIndex = sortedPoints.length - 1;
    return { startIndex, stopIndex };
}
async function fetchSleepHistory(hass, entityId, hoursAgo = 48) {
    const startTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
    try {
        const response = await hass.callWS({
            type: 'history/history_during_period',
            start_time: startTime,
            entity_ids: [entityId],
            minimal_response: true,
            no_attributes: true,
            significant_changes_only: false,
        });
        if (!(entityId in response)) {
            return [];
        }
        const rawData = response[entityId];
        return Array.isArray(rawData) ? rawData : [];
    }
    catch (error) {
        console.error('Failed to fetch sleep history from HA WebSocket API:', error);
        return [];
    }
}
function processSleepHistory(rawHistory, stateMapping) {
    const empty = {
        points: [],
        periodStart: new Date(),
        periodEnd: new Date(),
    };
    if (rawHistory.length === 0)
        return empty;
    const reverseMapping = reverseStateMapping(stateMapping);
    const sortedPoints = rawHistory
        .map((entry) => normalizeHistoryState(entry, reverseMapping))
        .filter((point) => point !== null)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    if (sortedPoints.length === 0)
        return empty;
    const { startIndex, stopIndex } = findSleepWindow(sortedPoints);
    let sleepPeriod = sortedPoints.slice(startIndex, stopIndex + 1);
    let points = sleepPeriod
        .filter((point) => isPhaseState(point.state))
        .map((point) => ({
        state: point.state,
        level: PHASE_LEVELS[point.state],
        timestamp: point.timestamp,
    }));
    if (points.length === 0) {
        points = sortedPoints
            .filter((point) => isPhaseState(point.state))
            .map((point) => ({
            state: point.state,
            level: PHASE_LEVELS[point.state],
            timestamp: point.timestamp,
        }));
        sleepPeriod = sortedPoints;
    }
    if (points.length === 0)
        return empty;
    const periodStart = points[0].timestamp;
    const periodEnd = sleepPeriod[sleepPeriod.length - 1]?.timestamp ??
        points[points.length - 1].timestamp;
    return { points, periodStart, periodEnd };
}

function logCardBanner(name, version) {
    console.info(`%c ${name} %c ${version} `, 'color: lime; background: darkgreen; font-weight: bold; border-radius: 4px 0 0 4px; padding: 4px 6px;', 'color: darkgreen; background: lime; font-weight: bold; border-radius: 0 4px 4px 0; padding: 4px 6px;');
}

function buildSleepSegments(history) {
    const { points, periodEnd } = history;
    if (points.length === 0)
        return [];
    const periodEndMs = periodEnd.getTime();
    const segments = [];
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const nextPoint = points[i + 1];
        const startMs = point.timestamp.getTime();
        const endMs = nextPoint ? nextPoint.timestamp.getTime() : periodEndMs;
        if (endMs <= startMs)
            continue;
        segments.push({
            state: point.state,
            level: point.level,
            startMs,
            endMs,
        });
    }
    return segments;
}
function mergeAdjacentSegments(segments) {
    if (segments.length === 0)
        return [];
    const merged = [{ ...segments[0] }];
    for (let i = 1; i < segments.length; i++) {
        const previous = merged[merged.length - 1];
        const current = segments[i];
        if (current.state === previous.state) {
            previous.endMs = current.endMs;
        }
        else {
            merged.push({ ...current });
        }
    }
    return merged;
}
function bucketSleepSegments(segments, periodStartMs, periodEndMs, bucketMinutes = CHART_CONFIG.bucketMinutes) {
    if (segments.length === 0 || periodEndMs <= periodStartMs)
        return [];
    const bucketMs = bucketMinutes * 60 * 1000;
    const buckets = [];
    for (let bucketStart = periodStartMs; bucketStart < periodEndMs; bucketStart += bucketMs) {
        const bucketEnd = Math.min(bucketStart + bucketMs, periodEndMs);
        const phaseDurations = new Map();
        for (const segment of segments) {
            const overlapStart = Math.max(segment.startMs, bucketStart);
            const overlapEnd = Math.min(segment.endMs, bucketEnd);
            if (overlapEnd <= overlapStart)
                continue;
            const duration = overlapEnd - overlapStart;
            const existing = phaseDurations.get(segment.state);
            if (existing) {
                existing.duration += duration;
            }
            else {
                phaseDurations.set(segment.state, {
                    level: segment.level,
                    duration,
                });
            }
        }
        if (phaseDurations.size === 0)
            continue;
        let dominant = { state: '', level: 0, duration: 0 };
        for (const [state, { level, duration }] of phaseDurations) {
            if (duration > dominant.duration) {
                dominant = { state, level, duration };
            }
        }
        buckets.push({
            state: dominant.state,
            level: dominant.level,
            startMs: bucketStart,
            endMs: bucketEnd,
        });
    }
    return mergeAdjacentSegments(buckets);
}

function formatPeriodRange(startMs, endMs, locale) {
    if (startMs === undefined ||
        endMs === undefined ||
        endMs <= startMs ||
        !locale) {
        return '';
    }
    return `${formatTime(new Date(startMs), locale)} — ${formatTime(new Date(endMs), locale)}`;
}

let HypnogramCard = class HypnogramCard extends i$2 {
    constructor() {
        super(...arguments);
        this._segments = [];
        this._rawSegments = [];
        this._loading = false;
        this._fetchGeneration = 0;
    }
    static getConfigElement() {
        return document.createElement('hypnogram-card-editor');
    }
    static getStubConfig() {
        return {
            type: 'custom:hypnogram-card',
            title: '',
            entity: '',
            grid_options: {
                rows: 4,
                columns: 12,
            },
        };
    }
    setConfig(config) {
        if (!config.entity) {
            throw new Error('You must define an entity');
        }
        this.config = {
            ...config,
            state_mapping: config.state_mapping || DEFAULT_STATE_MAPPING,
        };
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (!this.hass || !this.config?.entity)
            return;
        const entityId = this.config.entity;
        const currentState = this.hass.states[entityId]?.state;
        const entityChanged = this._lastEntityId !== entityId;
        const stateChanged = this._lastState !== currentState;
        const bucketMinutes = this._getBucketMinutes();
        const bucketChanged = this._lastBucketMinutes !== bucketMinutes;
        const needsInitialFetch = this._lastEntityId === undefined;
        if (bucketChanged && this._rawSegments.length > 0) {
            this._lastBucketMinutes = bucketMinutes;
            this._applyBucketedSegments();
        }
        if (entityChanged || stateChanged || needsInitialFetch) {
            this._lastEntityId = entityId;
            this._lastState = currentState;
            this._lastBucketMinutes = bucketMinutes;
            void this._updateHistory(entityId);
        }
    }
    _getBucketMinutes() {
        return clampBucketMinutes(this.config.bucket_minutes);
    }
    _applyBucketedSegments() {
        if (this._periodStartMs === undefined || this._periodEndMs === undefined) {
            this._segments = [];
            return;
        }
        this._segments = bucketSleepSegments(this._rawSegments, this._periodStartMs, this._periodEndMs, this._getBucketMinutes());
    }
    _handleAction(ev) {
        handleAction(this, this.hass, this.config, ev.detail.action);
    }
    async _updateHistory(entityId) {
        const generation = ++this._fetchGeneration;
        this._loading = true;
        try {
            const historyData = await fetchSleepHistory(this.hass, entityId);
            if (generation !== this._fetchGeneration)
                return;
            const history = processSleepHistory(historyData, this.config.state_mapping ?? DEFAULT_STATE_MAPPING);
            this._periodStartMs = history.periodStart.getTime();
            this._periodEndMs = history.periodEnd.getTime();
            this._rawSegments = buildSleepSegments(history);
            this._applyBucketedSegments();
        }
        catch (e) {
            console.error('Error fetching sleep history:', e);
        }
        finally {
            if (generation === this._fetchGeneration) {
                this._loading = false;
            }
        }
    }
    getCardSize() {
        return 4;
    }
    getGridOptions() {
        return {
            rows: 4,
            columns: 12,
            min_rows: 4,
        };
    }
    render() {
        if (!this.hass || !this.config) {
            return b ``;
        }
        const entityId = this.config.entity;
        const stateObj = this.hass.states[entityId];
        if (!stateObj) {
            return b `
        <div class="card error">
          ${localize$1('card.error_entity_not_found', this.hass)}: ${entityId}
        </div>
      `;
        }
        const showTitle = this.config.show_title !== false;
        const showPeriod = this.config.show_period_range !== false;
        const title = this.config.title || localize$1('card.title', this.hass);
        const periodRange = formatPeriodRange(this._periodStartMs, this._periodEndMs, this.hass.locale);
        const interactive = hasAction(this.config.tap_action) ||
            hasAction(this.config.hold_action) ||
            hasDoubleClick(this.config.double_tap_action);
        return b `
      <div
        class="card${interactive ? ' interactive' : ''}"
        @action=${this._handleAction}
        ${actionHandler({
            hasHold: hasAction(this.config.hold_action),
            hasDoubleClick: hasDoubleClick(this.config.double_tap_action),
        })}
        tabindex=${interactive ? '0' : '-1'}
      >
        ${showTitle || showPeriod
            ? b `
              <div class="header-row">
                <div class="header${showTitle ? '' : ' is-hidden'}">${title}</div>
                <div class="period-range${showPeriod ? '' : ' is-hidden'}">
                  ${periodRange}
                </div>
              </div>
            `
            : ''}
        <div class="chart-area">
          ${renderHypnogramChart(this._segments, this.hass, this.config.primary_color ?? DEFAULT_PRIMARY_COLOR, this.config.show_labels ?? false, this.config.legend_position ?? 'left', this)}
          ${this._loading
            ? b `
                <div class="loading-overlay">
                  ${localize$1('card.loading', this.hass)}
                </div>
              `
            : ''}
        </div>
      </div>
    `;
    }
    static { this.styles = [cardStyles, chartStyles]; }
};
__decorate([
    n$1({ attribute: false })
], HypnogramCard.prototype, "hass", void 0);
__decorate([
    r()
], HypnogramCard.prototype, "config", void 0);
__decorate([
    r()
], HypnogramCard.prototype, "_segments", void 0);
__decorate([
    r()
], HypnogramCard.prototype, "_rawSegments", void 0);
__decorate([
    r()
], HypnogramCard.prototype, "_periodStartMs", void 0);
__decorate([
    r()
], HypnogramCard.prototype, "_periodEndMs", void 0);
__decorate([
    r()
], HypnogramCard.prototype, "_loading", void 0);
HypnogramCard = __decorate([
    t$1('hypnogram-card')
], HypnogramCard);
logCardBanner(CARD_NAME, CARD_VERSION);
window.customCards = window.customCards ?? [];
window.customCards.push({
    type: 'hypnogram-card',
    name: CARD_NAME,
    description: 'Sleep hypnogram chart for Home Assistant',
    preview: true,
});

export { HypnogramCard };
