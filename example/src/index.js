var virt = require("virt"),
    virtDOM = require("virt-dom"),
    TextField = require("../..");


var AppPrototype;


function App(props, children, context) {
    virt.Component.call(this, props, children, context);
}
virt.Component.extend(App, "App");
AppPrototype = App.prototype;

AppPrototype.getChildContext = function() {
    return {
        muiTheme: {
            fontFamily: '"Times New Roman\", Times, serif',
            palette: {
                primaryColor: "#3E50B4",
                secondaryColor: "#303F9F",
                accentColor: "#FF3F80",
                disabledColor: "rgba(0,0,0,0.12)",
                primaryTextColor: "rgba(0,0,0,0.87)",
                secondaryTextColor: "rgba(0,0,0,0.5)",
                disabledTextColor: "rgba(0,0,0,0.38)",
                lightText: "#FFFFFF",
                errorColor: "#f44336"
            }
        }
    };
};

AppPrototype.render = function() {
    return (
        virt.createView("div", {
                className: "App",
                style: {
                    width: "800px"
                }
            },
            virt.createView("div", {
                    style: {
                        width: "50%",
                        float: "left"
                    }
                },
                virt.createView(TextField, {
                    hintText: "Hint Text"
                }),
                virt.createView(TextField, {
                    hintText: "Hint Text",
                    defaultValue: "Default Value"
                }),
                virt.createView(TextField, {
                    hintText: "Hint Text (MultiLine)",
                    multiLine: true
                }),
                virt.createView(TextField, {
                    hintText: "Hint Text",
                    errorText: "This field is required"
                }),
                virt.createView(TextField, {
                    hintText: "Hint Text",
                    defaultValue: "Text",
                    errorText: "This field is required"
                }),
                virt.createView(TextField, {
                    hintText: "Disabled Hint Text",
                    disabled: true
                }),
                virt.createView(TextField, {
                    hintText: "Disabled Hint Text",
                    disabled: true,
                    defaultValue: "Disabled With Value"
                })
            ),
            virt.createView("div", {
                    style: {
                        width: "50%",
                        float: "left"
                    }
                },
                virt.createView(TextField, {
                    hintText: "Disabled Hint Text",
                    floatingLabelText: "Floating Label Text"
                }),
                virt.createView(TextField, {
                        hintText: "Custom Child input (e.g. password)",
                        floatingLabelText: "Custom Child input (e.g. password)"
                    },
                    virt.createView("input", {
                        type: "password"
                    })
                )
            )
        )
    );
};

virtDOM.render(virt.createView(App), document.getElementById("app"));
