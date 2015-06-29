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
            fontFamily: "\"Times New Roman\", Times, serif",
            styles: {
                textField: {
                    textColor: "rgba(0, 0, 0, 0.87)",
                    hintColor: "rgba(0, 0, 0, 0.261)",
                    floatingLabelColor: "rgba(0, 0, 0, 0.87)",
                    disabledTextColor: "rgba(0, 0, 0, 0.261)",
                    errorColor: "#f44336",
                    focusColor: "#00bcd4",
                    backgroundColor: "transparent",
                    borderColor: "#90a4ae"
                }
            }
        }
    };
};

AppPrototype.render = function() {
    return (
        virt.createView("div", {
                className: "App"
            },
            virt.createView(TextField)
        )
    );
};

virtDOM.render(virt.createView(App), document.getElementById("app"));
