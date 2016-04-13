/* global validator */

// exported globals
var InputValidation;

var exports = (function () {
  "use strict";

  // Input validation class with functions to check for various sources of input
  InputValidation = function() {

  };


  InputValidation.prototype.ValidateNumberRange = function(target, val) {

    var min = target.attr("min");
    var max = target.attr("max");
    var range;

    if (min === undefined) {
      min = 0;
    }

    if (max === undefined) {
      max = 0;
    }

    if (max < min) {
      console.error("Max is < min");
    }

    // We want atleast a maximum value to make a range.
    if (max !== 0) {
      range = { min: parseInt(min), max: parseInt(max)};
    }

    return validator.isInt(parseInt(val), range);
  };

  InputValidation.prototype.ValidateAsciiString = function(target, val) {
    // We want to make this is an ascii string:
    var validate = validator.isAscii(val);

    // We can also check for maxlength:
    var maxlength = target.attr("maxlength");

    if (maxlength !== undefined) {
      validate = validate && validator.isLength(val, { min: 0, max: maxlength });
    }

    return validate;
  };

  return {
    InputValidation: InputValidation
  };

}());

// export the namespace object
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
}
