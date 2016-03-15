var virt = require("virt"),
    has = require("has"),
    propTypes = require("prop_types"),
    css = require("css"),
    extend = require("extend"),
    requestAnimationFrame = require("request_animation_frame");


var TextAreaPrototype;


module.exports = TextArea;


function TextArea(props, children, context) {

    virt.Component.call(this, props, children, context);

    this.state = {
        height: props.rows * 24
    };
}
virt.Component.extend(TextArea, "virt-ui-TextField-TextArea");

TextArea.propTypes = {
    onHeightChange: propTypes.func,
    textareaStyle: propTypes.object,
    rows: propTypes.number
};

TextArea.defaultProps = {
    rows: 1
};

TextAreaPrototype = TextArea.prototype;

TextAreaPrototype.componentDidMount = function() {
    this.setValue(this.props.value);
};

TextAreaPrototype.componentDidUpdate = function(prevProps) {
    var _this = this,
        value = this.props.value;

    if (prevProps.value !== value) {
        requestAnimationFrame(function onRequestAnimationFrame() {
            _this.__syncHeightWithShadow(value);
        });
    }
};

TextAreaPrototype.setValue = function(value, callback) {
    var _this = this;

    this.__syncHeightWithShadow(value, null, function onSyncHeightWithShadow() {
        _this.refs.textareaInput.setValue(value, callback);
    });
};

TextAreaPrototype.__getInput = function() {
    return this.refs.textareaInput;
};

TextAreaPrototype.__syncHeightWithShadow = function(newValue, e, callback) {
    var _this = this;

    function onSetValue(error) {
        requestAnimationFrame(function onRequestAnimationFrame() {
            var textareaShadow = _this.refs.textareaShadow;

            if (!error && !!textareaShadow) {
                textareaShadow.emitMessage("virt.getViewProperty", {
                    id: textareaShadow.getInternalId(),
                    property: "scrollHeight"
                }, function onGetProperty(error, newHeight) {
                    if (error) {
                        callback && callback(error);
                    } else {
                        if (_this.state.height !== newHeight) {
                            if (_this.props.onHeightChange) {
                                _this.props.onHeightChange(e, newHeight);
                            }
                            _this.setState({
                                height: newHeight
                            });
                        }
                        callback && callback();
                    }
                });
            } else {
                callback(error);
            }
        });
    }

    if (newValue !== undefined) {
        this.refs.textareaShadow.setValue(newValue, onSetValue);
    } else {
        onSetValue();
    }
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
            virt.createView("textarea", {
                ref: "textareaShadow",
                style: styles.textareaStyle,
                tabIndex: "-1",
                rows: props.rows,
                defaultValue: props.defaultValue,
                readOnly: true,
                value: props.value,
                valueLink: props.valueLink
            }),
            virt.createView("textarea", extend({}, props, {
                ref: "textareaInput",
                rows: props.rows,
                style: extend({}, styles.root, {
                    height: this.state.height + "px"
                }, props.textareaStyle)
            }))
        )
    );
};
