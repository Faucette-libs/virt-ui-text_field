var virt = require("virt"),
    uuid = require("uuid"),
    color = require("color"),
    propTypes = require("prop_types"),
    css = require("css"),
    extend = require("extend");


var TextFieldPrototype;


module.exports = TextField;


function TextField(props, children, context) {
    var _this = this,
        child = children[0],
        stateProps = child ? child.props : props;

    virt.Component.call(this, props, children, context);

    this.id = null;

    this.state = {
        errorText: this.props.errorText,
        hasValue: props.value || props.defaultValue || (props.valueLink && props.valueLink.value)
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

TextField.getDefaultProps = function() {
    return {
        fullWidth: false,
        type: "text",
        rows: 1
    };
};

TextFieldPrototype = TextField.prototype;

TextFieldPrototype.getId = function() {
    var id = this.id;

    if (id === null) {
        id = this.id = this.props.id || uuid();
    }

    return id;
};

TextFieldPrototype.getTheme = function() {
    return this.context.muiTheme.styles.textField;
};

var fade_color = color.create();

function fade(style, amount) {
    var value = fade_color;
    return color.toRGBA(color.smul(value, color.fromStyle(value, style), amount));
}

TextFieldPrototype.getStyles = function() {
    var state = this.state,
        props = this.props,
        theme = this.getTheme(),
        styles = {
            root: {
                fontSize: "16px",
                lineHeight: "24px",
                width: props.fullWidth ? "100%" : 256,
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
                bottom: 8,
                margin: 0,
                height: 0
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

    if (state.isFocused) {
        styles.floatingLabel.color = theme.focusColor;
        css.transform(styles.floatingLabel, "perspective(1px) scale(0.75) translate3d(2px, -28px, 0)");
        css.transform(styles.focusUnderline, "scaleX(1)");
    }

    if (state.hasValue) {
        styles.floatingLabel.color = fade(props.disabled ? theme.disabledTextColor : theme.floatingLabelColor, 0.5);
        css.transform(styles.floatingLabel, "perspective(1px) scale(0.75) translate3d(2px, -28px, 0)");
        css.opacity(styles.hint, 0);
    }

    if (props.floatingLabelText) {
        styles.hint.top = "24px";
        css.opacity(styles.hint, 0);
        css.boxSizing(styles.input, "border-box");
        if (state.isFocused && !state.hasValue) styles.hint.opacity = 1;
    }

    if (props.style && props.style.height) {
        styles.hint.lineHeight = props.style.height;
    }

    if (state.errorText && state.isFocused) {
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
    var styles = this.getStyles();

    console.log(styles);

    return (
        virt.createView("div", {
            className: "virt-ui-TextField"
        })
    );
};
