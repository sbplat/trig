var graphingCalculatorElement, graphingCalculators = [], hasGraphed = false

$(document).ready(function() {
    graphingCalculatorElement = document.getElementById("calculator")

    $("#functioninfo").submit(function(event) {
        event.preventDefault()

        let amplitude = parseFloat($("#amplitude").val() || 1),
            functiontype = $("#functiontype").val(),
            periodicityfactor = parseFloat($("#periodicityfactor").val() || 1),
            horizontalshift = parseFloat($("#horizontalshift").val() || 0),
            verticalshift = parseFloat($("#verticalshift").val() || 0)

        console.log(amplitude, functiontype, periodicityfactor, horizontalshift, verticalshift)
        graph(amplitude, functiontype, periodicityfactor, horizontalshift, verticalshift)
    })
})

$(window).resize(updateCalculatorHeight)

function updateCalculatorHeight() {
    if (!hasGraphed) {
        return
    }
    let graphingCalculatorHeight = parseInt(getComputedStyle(graphingCalculatorElement).width, 10) * 3 / 5
    graphingCalculatorElement.style.height = `${graphingCalculatorHeight}px`
}

function toFullFunctionName(name) {
    switch (name) {
        case "sin":
            return "sine"
        case "csc":
            return "cosecant"
        case "cos":
            return "cosine"
        case "sec":
            return "secant"
        case "tan":
            return "tangent"
        case "cot":
            return "cotangent"
    }
}

function generateVerticalLineLatex(y) {
    return `y=${y}`
}

function generateSinusoidalLatex(amplitude, functiontype, periodicityfactor, horizontalshift, verticalshift) {
    return `f\\left(x\\right)=${amplitude}\\${functiontype}\\left(${periodicityfactor}\\left(x${horizontalshift > 0 ? "-" : "+"}${Math.abs(horizontalshift)}\\right)\\right)${verticalshift > 0 ? "+" : "-"}${Math.abs(verticalshift)}`
}

function insertStep(text, functionString) {
    let textelement = document.createElement('p')
    textelement.innerHTML = text.replaceAll("\n", "<br>") + "<br>" + `<b>${functionString}</b>`
    graphingCalculatorElement.appendChild(textelement)
}

class Equation {
    constructor(name, latex, color, lineStyle) {
        this.name = name
        this.latex = latex
        this.color = color
        this.lineStyle = lineStyle
    }
}

function plot(equations, deltaX, deltaY) {
    graphingCalculator = Desmos.GraphingCalculator(graphingCalculatorElement, { expressions: false })
    graphingCalculators.push(graphingCalculator)
    let currentNum = 0
    equations.forEach(equation => {
        graphingCalculator.setExpression({
            id: equation.name || `function${currentNum++}`,
            latex: equation.latex,
            color: equation.color || Desmos.Colors.BLACK,
            lineStyle: equation.lineStyle || Desmos.Styles.SOLID
        })
    })
    graphingCalculator.setMathBounds({
        left: -10 + deltaX,
        right: 10 + deltaX,
        bottom: -7 + deltaY,
        top: 7 + deltaY
    })
}

function destroyAllCalculators() {
    for (let graphingCalculator of graphingCalculators) {
        graphingCalculator.destroy()
    }
}

function destroyAllElements() {
    graphingCalculatorElement.replaceChildren()
}

function graph(amplitude, functiontype, periodicityfactor, horizontalshift, verticalshift) {
    destroyAllCalculators()
    destroyAllElements()

    hasGraphed = true
    updateCalculatorHeight()

    let reciprocalfunction = false
    if (functiontype == "csc") {
        reciprocalfunction = true
        functiontype = "sin"
    } else if (functiontype == "sec") {
        reciprocalfunction = true
        functiontype = "cos"
    }

    let functionEquation = [
        "f(x)=",
        /* amplitude */
        "",
        /* function type */
        functiontype,
        /* function body begin */
        `(`,
        /* function body */
        `x`,
        /* function body end */
        `)`,
        /* vertical shift */
        ""
    ]

    let deltaX = 0, deltaY = 0
    let fullFunctionName = toFullFunctionName(functiontype)

    // basic function
    insertStep(`Graph basic ${fullFunctionName} function`,
               `${functionEquation.join("")}`)
    plot([new Equation("function1", generateSinusoidalLatex(1, functiontype, 1, 0, 0), Desmos.Colors.BLACK, Desmos.Styles.SOLID)], deltaX, deltaY)

    // period
    let reflecty = false
    if (periodicityfactor < 0) {
        periodicityfactor = Math.abs(periodicityfactor)
        reflecty = true
    }
    if (periodicityfactor != 1) {
        let period, periodformula, periodcalculation
        if (functiontype != "tan" && functiontype != "cot") {
            period = 2 * Math.PI / periodicityfactor
            periodformula = "period=2pi/|periodicity factor|"
            periodcalculation = `2pi/${periodicityfactor} = ${period}`
        } else {
            period = Math.PI / periodicityfactor
            periodformula = "period=pi/|periodicity factor|"
            periodcalculation = `pi/${periodicityfactor} = ${period}`
        }
        functionEquation[4] = `${periodicityfactor}x`
        insertStep(`Calculate the functions period using the formula,\n` +
                   `${periodformula}    =>    ${periodcalculation}\n` +
                   `Then, graph the ${fullFunctionName} function with the new period`,
                   `${functionEquation.join("")}`)
        plot([new Equation("function1", generateSinusoidalLatex(1, functiontype, periodicityfactor, 0, 0), Desmos.Colors.BLACK, Desmos.Styles.SOLID)], deltaX, deltaY)
    }
    if (reflecty) {
        periodicityfactor = -periodicityfactor
        functionEquation[4] = `${periodicityfactor != -1 ? periodicityfactor : "-"}x`
        if (functiontype == "cos") {
            insertStep(`The periodicity factor is negative but since ${fullFunctionName} is an even function,\n` +
                       `we don't need to reflect the function across the x-axis because f(-x)=f(x)`,
                       `${functionEquation.join("")}`)
        } else {
            insertStep(`The periodicity factor is negative and since ${fullFunctionName} is an odd function, reflect the function across the x-axis`,
                       `${functionEquation.join("")}`)
        }
        plot([new Equation("function1", generateSinusoidalLatex(1, functiontype, periodicityfactor, 0, 0), Desmos.Colors.BLACK, Desmos.Styles.SOLID)], deltaX, deltaY)
    }

    // amplitude
    let reflectx = false
    if (amplitude < 0) {
        amplitude = Math.abs(amplitude)
        reflectx = true
    }
    if (amplitude != 1) {
        functionEquation[1] = amplitude
        insertStep(`${amplitude < 1 ? "Compress" : "Stretch"} the height of the function vertically by a factor of ${amplitude}\n` +
                   `The new maximimum height is |amplitude| (${amplitude})\n` +
                   `The new minimum height is -|amplitude| (${-amplitude})`,
                   `${functionEquation.join("")}`)
        plot([new Equation("function1", generateSinusoidalLatex(amplitude, functiontype, periodicityfactor, 0, 0), Desmos.Colors.BLACK, Desmos.Styles.SOLID)], deltaX, deltaY)
    }
    if (reflectx) {
        amplitude = -amplitude
        functionEquation[1] = amplitude != -1 ? amplitude : "-"
        insertStep(`The amplitude is negative, so reflect the function across the x-axis`,
                   `${functionEquation.join("")}`)
        plot([new Equation("function1", generateSinusoidalLatex(amplitude, functiontype, periodicityfactor, 0, 0), Desmos.Colors.BLACK, Desmos.Styles.SOLID)], deltaX, deltaY)
    }

    // shifts
    if (horizontalshift != 0) {
        deltaX += horizontalshift
        let horizontalShiftSign = horizontalshift > 0
        if (periodicityfactor == 1) {
            functionEquation[4] += `${horizontalShiftSign ? "-" : "+"}${Math.abs(horizontalshift)}`
        } else {
            functionEquation[4] = `${periodicityfactor}(x${horizontalShiftSign ? "-" : "+"}${Math.abs(horizontalshift)})`
        }
        insertStep(`Shift the function horizontally to the ${horizontalShiftSign ? "right" : "left"} by ${Math.abs(horizontalshift)}`,
                   `${functionEquation.join("")}`)
        plot([new Equation("function1", generateSinusoidalLatex(amplitude, functiontype, periodicityfactor, horizontalshift, 0), Desmos.Colors.BLACK, Desmos.Styles.SOLID)], deltaX, deltaY)
    }

    if (verticalshift != 0) {
        deltaY += verticalshift
        let verticalShiftSign = verticalshift > 0
        functionEquation[6] = `${verticalShiftSign ? "+" : "-"}${Math.abs(verticalshift)}`
        insertStep(`Shift the function vertically ${verticalShiftSign ? "up" : "down"} by ${Math.abs(verticalshift)}`,
                   `${functionEquation.join("")}`)
        plot([new Equation("function1", generateSinusoidalLatex(amplitude, functiontype, periodicityfactor, horizontalshift, verticalshift), Desmos.Colors.BLACK, Desmos.Styles.SOLID)], deltaX, deltaY)
    }

    if (reciprocalfunction) {
        if (functiontype == "sin") {
            functionEquation[2] = "csc"
        } else if (functiontype == "cos") {
            functionEquation[2] = "sec"
        }
        insertStep(`Draw the reciprocal function of the ${fullFunctionName} function`,
                   `${functionEquation.join("")}`)

        plot([new Equation("function1", generateSinusoidalLatex(amplitude, functiontype, periodicityfactor, horizontalshift, verticalshift), Desmos.Colors.BLUE, Desmos.Styles.DASHED),
              new Equation("function2", generateSinusoidalLatex(amplitude, functionEquation[2], periodicityfactor, horizontalshift, verticalshift), Desmos.Colors.BLACK, Desmos.Styles.SOLID)],
             deltaX, deltaY)
    }
}
