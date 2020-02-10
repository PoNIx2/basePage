/*!
 * EventContainer.js
 *
 * Copyright (c) 2020 Takuya Oishi
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 */

function EventContainer(pageData) {
    this.pd = pageData || new DataContainer;
    if(this.pd.get("running")) {
        this.pd.get("running")._target = false;
        this.pd.get("running").setStyle = false;
        this.pd.get("running").readContentP = false;
        this.pd.get("running").readContentG = false;
        this.pd.get("running").setMainContent = false;
        this.pd.get("running").setContent = false;
    } else {
        this.pd.set("running", {
            "_target": false,
            "setStyle": false,
            "readContentP": false,
            "readContentG": false,
            "setMainContent": false,
            "setContent": false
        });
    }
    if(!this.pd.get("connector")) {
        this.pd.set("connector", new Connect(pageData));
    }
};
EventContainer.prototype = {
    _target: function(key, ex) {
        if(this.pd.get("running")._target) {
            return;
        }
        this.pd.get("running")._target = true;
        try {
            if(key[0] === "#") {
                this.pd.get("running")._target = false;
                return document.querySelector(key);
            } else if(key[0] === ".") {
                if(ex) {
                    if(ex === "all") {
                        this.pd.get("running")._target = false;
                        return document.querySelectorAll(key);
                    } else {
                        this.pd.get("running")._target = false;
                        return document.querySelector(key)[ex * 1];
                    }
                } else {
                    this.pd.get("running")._target = false;
                    return document.querySelector(key);
                }
            } else {
                if(ex) {
                    if(ex === "tag") {
                        this.pd.get("running")._target = false;
                        return document.getElementsByTagName(key);
                    } else if(ex === "name") {
                        this.pd.get("running")._target = false;
                        return document.getElementsByName(key);
                    }
                } else {
                    this.pd.get("running")._target = false;
                    return document.getElementsByTagName(key);
                }
            }
        } catch(e2) {
            this.pd.get("running")._target = false;
        }
    },
    readStyle: function(key) {
        if(this.pd.get("running").setStyle) {
            return;
        }
        this.pd.get("running").setStyle = true;
        this.pd.get("connector").reservation({
            "method": "GET",
            "url": key,
            "type": "json",
            "callback": function(e) {
                try {
                    const contents = e.response.contents;
                    e.pd.get("events").createContents(contents);
                    e.pd.get("running").setStyle = false;
                } catch {
                    e.pd.get("running").setStyle = false;
                }
            }
        });
        this.pd.get("connector").run();
    },
    readContentP: function(key) {
        if(this.pd.get("running").readContentP) {
            return;
        }
        this.pd.get("running").readContentP = true;
        this.pd.get("connector").reservation({
            "method": "POST",
            "url": key,
            "type": "json",
            "callback": function(e) {
                try {
                    const contents = e.response.contents;
                    e.pd.get("events").createContents(contents);
                    e.pd.get("running").readContentP = false;
                } catch {
                    e.pd.get("running").readContentP = false;
                }
            }
        });
        this.pd.get("connector").run();
    },
    readContentG: function(key) {
        if(this.pd.get("running").readContentG) {
            return;
        }
        this.pd.get("running").readContentG = true;
        this.pd.get("connector").reservation({
            "method": "GET",
            "url": key,
            "type": "json",
            "callback": function(e) {
                try {
                    const contents = e.response.contents;
                    e.pd.get("events").createContents(contents);
                    e.pd.get("running").readContentG = false;
                } catch {
                    e.pd.get("running").readContentG = false;
                }
            }
        });
        this.pd.get("connector").run();
    },
    createContents: function(contents) {
        if(this.pd.get("running").setMainContent) {
            return;
        }
        this.pd.get("running").setMainContent = true;
        try {
            if(contents.length) {
                for(let step = 0, len = contents.length; step < len; step++) {
                    let content = contents[step];
                    this.createContent(content);
                }
            }
            this.pd.get("running").setMainContent = false;
        } catch(e2) {
            this.pd.get("running").setMainContent = false;
        }
    },
    createContent: function(content) {
        if(this.pd.get("running").setContent) {
            return;
        }
        this.pd.get("running").setContent = true;
        try {
            if(content.tag && content.parent) {
                let newElement = document.createElement(content.tag);
                if(content.extend) {
                    for(let exKey in content.extend) {
                        if(content.extend[exKey]) {
                            if(exKey === "event") {
                                for(let eventKey in content.extend[exKey]) {
                                    if(content.extend[exKey][eventKey]) {
                                        newElement[eventKey] = this.pd.get("events")[content.extend[exKey][eventKey]];
                                    }
                                }
                            } else if(exKey === "data") {
                                for(let dataKey in content.extend[exKey]) {
                                    if(content.extend[exKey][dataKey]) {
                                        newElement.dataset[dataKey] = content.extend[exKey][dataKey];
                                    }
                                }
                            } else if(exKey === "class") {
                                for(let classStep = 0, classLen = content.extend[exKey].length; classStep < classLen; classStep++) {
                                    if(content.extend[exKey][classStep]) {
                                        newElement.classList.add(content.extend[exKey][classStep]);
                                    }
                                }
                            } else if(exKey === "innerHTML") {
                                newElement.innerHTML = content.extend[exKey];
                            } else if(exKey === "text") {
                                let newText = document.createTextNode(content.extend[exKey]);
                                newElement.appendChild(newText);
                            } else {
                                newElement.setAttribute(exKey, content.extend[exKey]);
                            }
                        }
                    }
                }
                if(this._target(content.parent).length) {
                    for(let elemStep = 0, elemLen = this._target(content.parent).length; elemStep < elemLen; elemStep++) {
                        if(content.appendType) {
                            if(content.appendType === "clear") {
                                this._target(content.parent)[elemStep].innerHTML = "";
                            }
                        }
                        this._target(content.parent)[elemStep].appendChild(newElement.cloneNode(true));
                    }
                } else {
                    if(content.appendType) {
                        if(content.appendType === "clear") {
                            this._target(content.parent).innerHTML = "";
                        }
                    }
                    this._target(content.parent).appendChild(newElement);
                }
            }
            this.pd.get("running").setContent = false;
        } catch(e2) {
            this.pd.get("running").setContent = false;
        }
    }
};