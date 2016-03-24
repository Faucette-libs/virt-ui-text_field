var virt = require("virt"),
    has = require("has"),
    propTypes = require("prop_types"),
    css = require("css"),
    extend = require("extend"),
    emptyFunction = require("empty_function"),
    requestAnimationFrame = require("request_animation_frame");


var reEOL = /\r\n|\r|\n/,
    TextAreaPrototype;


module.exports = TextArea;


function TextArea(props, children, context) {

    virt.Component.call(this, props, children, context);

    this.__height = props.rows * 24;
}
virt.Component.extend(TextArea, "virt-ui-TextField-TextArea");

TextArea.propTypes = {
    onHeightChange: propTypes.func,
    textareaStyle: propTypes.object,
    rows: propTypes.number
};

TextArea.defaultProps = {
    onHeightChange: emptyFunction,
    rows: 1
};

TextAreaPrototype = TextArea.prototype;

TextAreaPrototype.componentDidMount = function() {
    var _this = this;

    requestAnimationFrame(function onRequestAnimationFrame() {
        _this.setValue(_this.props.value);
    });
};

TextAreaPrototype.componentDidUpdate = function(prevProps) {
    var _this = this,
        value = this.props.value;

    if (prevProps.value !== value) {
        requestAnimationFrame(function onRequestAnimationFrame() {
            _this.__getHeight(value);
        });
    }
};

TextAreaPrototype.setValue = function(value, callback) {
    var _this = this;

    this.refs.textareaInput.setValue(value, function onSetValue(error) {
        if (error) {
            callback && callback(error);
        } else {
            _this.__getHeight(value);
        }
    });
};

TextAreaPrototype.__getHeight = function(value) {
    var rows = value.split(reEOL).length,
        newHeight = rows * 24;

    if (this.__height !== newHeight) {
        this.__height = newHeight;
        this.props.onHeightChange(newHeight);
    }
};

TextAreaPrototype.__getInput = function() {
    return this.refs.textareaInput;
};

TextAreaPrototype.getStyles = function() {
    var styles = {
        root: {
            width: "100%",
            resize: "none",
            overflow: "hidden",
            font: "inherit",
            padding: 0
        },
        textareaStyle: {
            position: "absolute",
            width: "100%",
            resize: "none",
            overflow: "hidden",
            font: "inherit",
            padding: 0
        }
    };

    css.opacity(styles.textareaStyle, 0);

    return styles;
};

TextAreaPrototype.render = function() {
    var props = this.props,
        styles = this.getStyles();

    if (has(props, "valueLink")) {
        props.value = props.valueLink.value;
    }
    if (props.disabled) {
        props.style.cursor = "default";
    }

    return (
        virt.createView("div", {
                className: "virt-ui-TextField-TextArea",
                style: props.style
            },
            virt.createView("textarea", extend({}, props, {
                ref: "textareaInput",
                rows: props.rows,
                defaultValue: props.defaultValue,
                value: props.value,
                valueLink: props.valueLink,
                style: extend({}, styles.root, props.textareaStyle)
            }))
        )
    );
};
