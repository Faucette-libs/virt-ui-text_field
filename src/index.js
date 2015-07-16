var virt = require("virt"),
    virtDOM = require("virt-dom"),
    has = require("has"),
    blurNode = require("blur_node"),
    focusNode = require("focus_node"),
    uuid = require("uuid"),
    propTypes = require("prop_types"),
    css = require("css"),
    extend = require("extend"),
    TextArea = require("./TextArea");


var TextFieldPrototype;


module.exports = TextField;


function TextField(props, children, context) {
    var _this = this;

    virt.Component.call(this, props, children, context);

    this.id = null;

    this.state = {
        focus: false,
        errorText: props.errorText,
        hasValue: props.value || props.defaultValue || (props.valueLink && props.valueLink.value)
    };

    this.onTextAreaHeightChange = function onTextAreaHeightChange(e, height) {
        return _this.__onTextAreaHeightChange(e, height);
    };
    this.onInputChange = function onInputChange(e) {
        return _this.__onInputChange(e);
    };
    this.onInputFocus = function onInputFocus(e) {
        return _this.__onInputFocus(e);
    };
    this.onInputBlur = function onInputBlur(e) {
        return _this.__onInputBlur(e);
    };
    this.onInputKeyDown = function InputKeyDown(e) {
        return _this.__onInputKeyDown(e);
    };
}
virt.Component.extend(TextField, "virt-ui-TextField");

TextField.contextTypes = {
    muiTheme: propTypes.implement({
        fontFamily: propTypes.string.isRequired,
        styles: propTypes.implement({
            textField: propTypes.implement({
                textColor: propTypes.string.isRequired,
                hintColor: propTypes.string.isRequired,
                floatingLabelColor: propTypes.string.isRequired,
                disabledTextColor: propTypes.string.isRequired,
                errorColor: propTypes.string.isRequired,
                focusColor: propTypes.string.isRequired,
                backgroundColor: propTypes.string.isRequired,
                borderColor: propTypes.string.isRequired
            }).isRequired
        }).isRequired
    }).isRequired
};

TextField.propTypes = {
    errorText: propTypes.string,
    floatingLabelText: propTypes.string,
    fullWidth: propTypes.bool,
    hintText: propTypes.string,
    id: propTypes.string,
    multiLine: propTypes.bool,
    onBlur: propTypes.func,
    onChange: propTypes.func,
    onFocus: propTypes.func,
    onKeyDown: propTypes.func,
    onEnterKeyDown: propTypes.func,
    type: propTypes.string,
    rows: propTypes.number,
    inputStyle: propTypes.object,
    floatingLabelStyle: propTypes.object
};

TextField.defaultProps = {
    fullWidth: false,
    type: "text",
    rows: 1
};

TextFieldPrototype = TextField.prototype;

TextFieldPrototype.getId = function() {
    var id = this.id;

    if (id === null) {
        id = this.id = this.props.id || uuid();
    }

    return id;
};

TextFieldPrototype.focus = function() {
    focusNode(this.__getInputNode());
};

TextFieldPrototype.blur = function() {
    blurNode(this.__getInputNode());
};

TextFieldPrototype.clearValue = function() {
    this.setValue("");
};

TextFieldPrototype.setErrorText = function(newErrorText) {
    if (process.env.NODE_ENV !== "production" && has(this.props, "errorText")) {
        console.error("Cannot call TextField.setErrorText when errorText is defined as a property.");
    } else if (this.isMounted()) {
        this.setState({
            errorText: newErrorText
        });
    }
};

function checkHasValue(value) {
    return value !== "" && value != null;
}

TextFieldPrototype.setValue = function(newValue, callback) {
    if (process.env.NODE_ENV !== "production" && this.__isControlled()) {
        console.error("Cannot call TextField.setValue when value or valueLink is defined as a property.");
    }

    if (callback) {
        return this.__getInput().setValue(newValue, callback);
    } else if (this.isMounted()) {
        if (this.props.multiLine) {
            this.refs[this.__getRef()].setValue(newValue);
        } else {
            this.__getInputNode().value = newValue;
        }

        this.setState({
            hasValue: checkHasValue(newValue)
        });
    }
};

TextFieldPrototype.getValue = function(callback) {
    if (callback) {
        return this.__getInput().getValue(callback);
    } else {
        return this.isMounted() ? this.__getInputNode().value : undefined;
    }
};

TextFieldPrototype.componentWillReceiveProps = function(nextProps, nextChildren) {
    var newState = {},
        nextChild = nextChildren[0],
        hasValueLinkProp, hasValueProp, hasNewDefaultValue;

    newState.errorText = nextProps.errorText;

    if (nextChild && nextChild.props) {
        nextProps = nextChild.props;
    }

    hasValueLinkProp = nextProps.hasOwnProperty("valueLink");
    hasValueProp = nextProps.hasOwnProperty("value");
    hasNewDefaultValue = nextProps.defaultValue !== this.props.defaultValue;

    if (hasValueLinkProp) {
        newState.hasValue = nextProps.valueLink.value;
    } else if (hasValueProp) {
        newState.hasValue = nextProps.value;
    } else if (hasNewDefaultValue) {
        newState.hasValue = nextProps.defaultValue;
    }

    this.setState(newState);
};

TextFieldPrototype.__onTextAreaHeightChange = function(e, height) {
    var newHeight = height + 24;
    if (this.props.floatingLabelText) {
        newHeight += 24;
    }
    virtDOM.findDOMNode(this).style.height = newHeight + "px";
};

TextFieldPrototype.__onInputFocus = function(e) {
    var props = this.props;

    if (!props.disabled) {
        if (props.onFocus) {
            props.onFocus(e);
        }
        this.setState({
            focus: true
        });
    }
};

TextFieldPrototype.__onInputBlur = function(e) {
    if (this.props.onBlur) {
        this.props.onBlur(e);
    }
    this.setState({
        focus: false
    });
};

TextFieldPrototype.__onInputChange = function(e) {
    var child = this.children[0],
        props = this.props;

    if (child && child.props.onChange) {
        child.props.onChange(e);
    }
    if (props.onChange) {
        props.onChange(e);
    }
    this.setState({
        hasValue: checkHasValue(e.target.value)
    });
};

TextFieldPrototype.__onInputKeyDown = function(e) {
    if (e.keyCode === 13 && this.props.onEnterKeyDown) {
        this.props.onEnterKeyDown(e);
    }
    if (this.props.onKeyDown) {
        this.props.onKeyDown(e);
    }
};

TextFieldPrototype.__getRef = function() {
    var props = this.props;
    return props.ref ? props.ref : "input";
};

TextFieldPrototype.__getInput = function() {
    var ref = this.refs[this.__getRef()],
        props = this.props;
    return (props.children || props.multiLine) ? ref.__getInput() : ref;
};

TextFieldPrototype.__getInputNode = function() {
    return virtDOM.findDOMNode(this.__getInput());
};

TextFieldPrototype.__isControlled = function() {
    var props = this.props;
    return has(props, "value") || has(props, "valueLink");
};

TextFieldPrototype.getTheme = function() {
    return this.context.muiTheme.styles.textField;
};

TextFieldPrototype.getStyles = function() {
    var state = this.state,
        props = this.props,
        theme = this.getTheme(),
        styles = {
            root: {
                fontSize: "16px",
                lineHeight: "24px",
                width: props.fullWidth ? "100%" : "256px",
                height: ((props.rows - 1) * 24 + (props.floatingLabelText ? 72 : 48)) + "px",
                display: "inline-block",
                position: "relative",
                fontFamily: this.context.muiTheme.fontFamily
            },
            error: {
                position: "absolute",
                bottom: "-10px",
                fontSize: "12px",
                lineHeight: "12px",
                color: theme.errorColor
            },
            hint: {
                position: "absolute",
                lineHeight: "48px",
                color: theme.hintColor
            },
            input: {
                WebkitTapHighlightColor: "rgba(0,0,0,0)",
                position: "relative",
                width: "100%",
                height: "100%",
                border: "none",
                outline: "none",
                backgroundColor: theme.backgroundColor,
                color: props.disabled ? theme.disabledTextColor : theme.textColor,
                font: "inherit"
            },
            underline: {
                border: "none",
                borderBottom: "solid 1px " + theme.borderColor,
                position: "absolute",
                width: "100%",
                bottom: "8px",
                margin: "0px",
                height: "0px"
            },
            underlineAfter: {
                position: "absolute",
                width: "100%",
                overflow: "hidden",
                userSelect: "none",
                cursor: "default",
                bottom: "8px",
                borderBottom: "dotted 2px " + theme.disabledTextColor
            }
        };

    css.transition(styles.root, "all 450ms cubic-bezier(0.23, 1, 0.32, 1)");
    css.transition(styles.error, "all 450ms cubic-bezier(0.23, 1, 0.32, 1)");

    css.opacity(styles.hint, 1);
    css.transition(styles.hint, "all 450ms cubic-bezier(0.23, 1, 0.32, 1)");

    css.boxSizing(styles.underline, "content-box");

    styles.floatingLabel = extend({}, styles.hint, {
        lineHeight: "20px",
        top: "38px"
    });
    css.opacity(styles.floatingLabel, 1);
    css.transform(styles.floatingLabel, "scale(1) translate3d(0, 0, 0)");
    css.transformOrigin(styles.floatingLabel, "left top");

    styles.textarea = extend({}, styles.input, {
        marginTop: props.floatingLabelText ? "36px" : "12px",
        marginBottom: props.floatingLabelText ? "-36px" : "-12px",
        font: "inherit"
    });
    css.boxSizing(styles.textarea, "border-box");

    styles.focusUnderline = extend({}, styles.underline, {
        borderBottom: "solid 2px",
        borderColor: theme.focusColor
    });
    css.transform(styles.focusUnderline, "scaleX(0)");
    css.transition(styles.focusUnderline, "all 450ms cubic-bezier(0.23, 1, 0.32, 1)");

    if (state.focus) {
        styles.floatingLabel.color = theme.focusColor;
        css.transform(styles.floatingLabel, "perspective(1px) scale(0.75) translate3d(2px, -28px, 0)");
        css.transform(styles.focusUnderline, "scaleX(1)");
    }

    if (state.hasValue) {
        styles.floatingLabel.color = css.fade(props.disabled ? theme.disabledTextColor : theme.floatingLabelColor, 0.5);
        css.transform(styles.floatingLabel, "perspective(1px) scale(0.75) translate3d(2px, -28px, 0)");
        css.opacity(styles.hint, 0);
    }

    if (props.floatingLabelText) {
        styles.hint.top = "24px";
        css.boxSizing(styles.input, "border-box");
        if (state.focus && !state.hasValue) {
            css.opacity(styles.hint, 1);
        } else {
            css.opacity(styles.hint, 0);
        }
    }

    if (props.style && props.style.height) {
        styles.hint.lineHeight = props.style.height;
    }

    if (state.errorText && state.focus) {
        styles.floatingLabel.color = theme.errorColor;
    }
    if (props.floatingLabelText && !props.multiLine) {
        styles.input.paddingTop = "26px";
    }

    if (state.errorText) {
        styles.focusUnderline.borderColor = theme.errorColor;
        css.transform(styles.focusUnderline, "scaleX(1)");
    }

    return styles;
};

TextFieldPrototype.render = function() {
    var state = this.state,
        props = this.props,
        styles = this.getStyles(),
        child = this.children[0],
        id = this.getId(),
        inputProps = {
            id: id,
            ref: this.__getRef(),
            style: extend({}, styles.input, props.inputStyle),
            onBlur: this.onInputBlur,
            onFocus: this.onInputFocus,
            disabled: props.disabled,
            onKeyDown: this.onInputKeyDown
        },
        children = [];

    if (props.floatingLabelText) {
        children[children.length] = virt.createView("label", {
            "for": id,
            style: extend({}, styles.floatingLabel, props.floatingLabelStyle)
        }, props.floatingLabelText);
    }
    if (props.hintText) {
        children[children.length] = virt.createView("div", {
            style: extend({}, styles.hint)
        }, props.hintText);
    }

    if (!has(props, "valueLink")) {
        inputProps.onChange = this.onInputChange;
    }
    if (child) {
        children[children.length] = virt.cloneView(child, extend(inputProps, child.props, {
            style: extend(inputProps.style, child.props.style)
        }));
    } else {
        children[children.length] = props.multiLine ? (
            virt.createView(TextArea, extend(inputProps, props, {
                style: extend(inputProps.style, props.style),
                rows: props.rows,
                onHeightChange: this.onTextAreaHeightChange,
                textareaStyle: styles.textarea
            }))
        ) : (
            virt.createView("input", extend(inputProps, props, {
                style: extend(inputProps.style, props.style)
            }))
        );
    }

    children[children.length] = props.disabled ? (
        virt.createView("div", {
            style: styles.underlineAfter
        })
    ) : (
        virt.createView("hr", {
            style: styles.underline
        })
    );

    children[children.length] = virt.createView("hr", {
        style: styles.focusUnderline
    });

    if (state.errorText) {
        children[children.length] = virt.createView("div", {
            style: styles.error
        }, state.errorText);
    }

    return (
        virt.createView("div", {
            className: "virt-ui-TextField",
            style: extend({}, styles.root, props.style)
        }, children)
    );
};
