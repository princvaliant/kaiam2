var makeItArrayIfItsNot = function(input) {
    return Object.prototype.toString.call(input) !== '[object Array]'
        ? [input]
        : input;
};

var linearRegression = function(functionValuesX, functionValuesY) {
    var regression = {};
    var x = functionValuesX;
    var y = functionValuesY;
    var n = y.length;
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var sum_yy = 0;

    for (var i = 0; i < y.length; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += (x[i] * y[i]);
        sum_xx += (x[i] * x[i]);
        sum_yy += (y[i] * y[i]);
    }

    regression.slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    regression.intercept = (sum_y - regression.slope * sum_x) / n;
    regression.rSquared = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);
    regression.evaluateY = function(pointsToEvaluate) {
        var x = makeItArrayIfItsNot(pointsToEvaluate),
            result = [],
            that = this;
        x.forEach(function (point) {
            result.push(that.slope * point + that.intercept);
        })
        return result;
    };
    regression.evaluateX = function(pointsToEvaluate) {
        var y = makeItArrayIfItsNot(pointsToEvaluate),
            result = [],
            that = this;
        y.forEach(function (point) {
            if (that.slope !== 0) {
                result.push((point - that.intercept) / that.slope);
            }
        })
        return result;
    };
    return regression;
};

_.extend(Meteor, {
    linearRegression: linearRegression
});
