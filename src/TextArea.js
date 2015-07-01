var virt = require("virt"),
    has = require("has"),
    virtDOM = require("virt-dom"),
    propTypes = require("prop_types"),
    css = require("css"),
    extend = require("extend");


var TextAreaPrototype;


module.exports = TextArea;


function TextArea(props, children, context) {
    var _this = this;

    virt.Component.call(this, props, children, context);

    this.state = {
        height: props.rows * 24
    };

    this.onChange = function(e) {
        return _this.__onChange(e);
    };
}
virt.Component.extend(TextArea, "virt-ui-TextField-TextArea");

TextArea.propTypes = {
    onChange: propTypes.func,
    onHeightChange: propTypes.func,
    textareaStyle: propTypes.object,
    rows: propTypes.number
};

TextArea.getDefaultProps = function() {
    return {
        rows: 1
    };
};

TextAreaPrototype = TextArea.prototype;

TextAreaPrototype.componentDidMount = function() {
    this.__syncHeightWithShadow();
};

TextAreaPrototype.componentWillReceiveProps = function(nextProps) {
    if (nextProps.value !== this.props.value) {
        this.__syncHeightWithShadow(nextProps.value);
    }
};

TextAreaPrototype.setValue = function(value, callback) {
    var _this = this;
    this.refs.input.setValue(value, function(error) {
        if (error) {
            callback && callback(error);
        } else {
            callback && callback();
        }
    });
    _this.__syncHeightWithShadow(value);
};

TextAreaPrototype.__syncHeightWithShadow = function(newValue, e) {
    var shadow = virtDOM.findDOMNode(this.refs.shadow),
        currentHeight = this.state.height,
        newHeight;

    if (newValue !== undefined) {
        shadow.value = newValue;
    }
    newHeight = shadow.scrollHeight;

    if (currentHeight !== newHeight) {
        this.setState({
            height: newHeight
        });
        if (this.props.onHeightChange) {
            this.props.onHeightChange(e, newHeight);
        }
    }
};

TextAreaPrototype.__onChange = function(e) {
    var props = this.props;

    this.__syncHeightWithShadow(e.target.value, e);

    if (has(props, "valueLink")) {
        props.valueLink.requestChange(e.target.value);
    }
    if (props.onChange) {
        props.onChange(e);
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
                ref: "shadow",
                style: styles.textareaStyle,
                tabIndex: "-1",
                rows: props.rows,
                defaultValue: props.defaultValue,
                readOnly: true,
                value: props.value,
                valueLink: props.valueLink
            }),
            virt.createView("textarea", extend({}, props, {
                ref: "input",
                rows: props.rows,
                style: extend({}, styles.root, {
                    height: this.state.height + "px"
                }, props.textareaStyle),
                onChange: this.onChange
            }))
        )
    );
};
