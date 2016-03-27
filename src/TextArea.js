var virt = require("virt"),
    css = require("css"),
    has = require("has"),
    propTypes = require("prop_types"),
    extend = require("extend"),
    emptyFunction = require("empty_function"),
    isNullOrUndefined = require("is_null_or_undefined");


var ROWS_HEIGHT = 24,
    TextAreaPrototype;


module.exports = TextArea;


function TextArea(props, children, context) {
    var _this = this;

    virt.Component.call(this, props, children, context);

    this.state = {
        height: props.rows * ROWS_HEIGHT
    };

    this.onChange = function(e) {
        return _this.__onChange(e);
    };
}
virt.Component.extend(TextArea, "virt-ui-TextField-TextArea");

TextArea.propTypes = {
    onHeightChange: propTypes.func,
    textareaStyle: propTypes.object,
    rowsMax: propTypes.number,
    rows: propTypes.number
};

TextArea.defaultProps = {
    onHeightChange: emptyFunction,
    rows: 1
};

TextAreaPrototype = TextArea.prototype;

TextAreaPrototype.componentDidMount = function() {
    this.setValue(this.props.value);
};

TextAreaPrototype.componentWillReceiveProps = function(nextProps) {
    if (this.props.value !== nextProps.value) {
        this.setValue(nextProps.value);
    }
};

TextAreaPrototype.setValue = function(value, callback) {
    var _this = this;

    this.__syncHeightWithShadow(value, null, function onSyncHeightWithShadow() {
        _this.refs.textareaInput.setValue(value, callback);
    });
};

TextAreaPrototype.__syncHeightWithShadow = function(newValue, e, callback) {
    var _this = this,
        shadowInput = this.refs.shadowInput;

    function onSetValue(error) {
        if (error) {
            callback && callback(error);
        } else {
            shadowInput.emitMessage("virt.getViewProperty", {
                id: shadowInput.getInternalId(),
                property: "scrollHeight"
            }, function onGetViewProperty(error, newHeight) {
                var props;

                if (error) {
                    callback && callback(error);
                } else {
                    props = _this.props;

                    if (props.rowsMax >= props.rows) {
                        newHeight = Math.min(props.rowsMax * ROWS_HEIGHT, newHeight);
                    }
                    newHeight = Math.max(newHeight, ROWS_HEIGHT);

                    if (_this.state.height !== newHeight) {
                        _this.setState({
                            height: newHeight
                        });
                        _this.props.onHeightChange(e, newHeight);
                    }

                    callback && callback();
                }
            });
        }
    }

    if (isNullOrUndefined(newValue)) {
        onSetValue();
    } else {
        shadowInput.setValue(newValue, false, onSetValue);
    }
};

TextAreaPrototype.__onChange = function(e) {
    var _this = this,
        props = this.props,
        textareaInput = this.refs.textareaInput;

    e.persist();

    textareaInput.getValue(function onGetValue(error, value) {
        if (!error) {
            e.value = value;

            _this.__syncHeightWithShadow(value, e);

            if (props.onChange) {
                props.onChange(e);
            }
            if (has(props, "valueLink")) {
                props.valueLink.requestChange(value);
            }
        }
    });
};

TextAreaPrototype.__getInput = function() {
    return this.refs.textareaInput;
};

TextAreaPrototype.getStyles = function() {
    var styles = {
        root: {
            position: "relative"
        },
        textarea: {
            font: "inherit",
            width: "100%",
            height: this.state.height + "px",
            resize: "none",
            padding: "0px",
            cursor: this.props.disabled ? "default" : "initial"
        },
        shadow: {
            font: "inherit",
            resize: "none",
            overflow: "hidden",
            visibility: "hidden",
            position: "absolute",
            width: "100%",
            height: "initial"
        }
    };

    css.userSelect(styles.textarea, "text");

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
                style: extend(styles.root, props.style)
            },
            virt.createView("textarea", {
                ref: "shadowInput",
                tabIndex: "-1",
                rows: props.rows,
                defaultValue: props.defaultValue,
                value: props.value,
                valueLink: props.valueLink,
                readOnly: true,
                style: styles.shadow
            }),
            virt.createView("textarea", extend({}, props, {
                ref: "textareaInput",
                rows: props.rows,
                onChange: this.onChange,
                style: extend({}, styles.textarea, props.textareaStyle)
            }))
        )
    );
};
