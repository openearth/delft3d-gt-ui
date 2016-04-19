/* global validator */

// exported globals
var InputValidation;

var exports = (function() {
  "use strict";

  // Input validation class with functions to check for various sources of input
  InputValidation = function() {

  };

  // Move this to different function.
  // This is code only used in one part of the front end.
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
      range = {
        min: parseFloat(min),
        max: parseFloat(max)
      };
    }

    return validator.isFloat(parseFloat(val), range);
  };

  // Old version, it is still used but want to get rid of it.
  InputValidation.prototype.ValidateAsciiString = function(target, val) {
    // We want to make this is an ascii string:
    var validate = validator.isAscii(val);

    // We can also check for maxlength:
    var maxlength = target.attr("maxlength");

    if (maxlength !== undefined) {
      validate = validate && validator.isLength(val, {
        min: 0,
        max: maxlength
      });
    }

    return validate;
  };

  // Check if a number is in a given range or not. Returns true if it does.
  InputValidation.prototype.validateNumberInRange = function(val, min, max) {

    var range;

    if (min === undefined) {
      min = 0;
    }

    if (max === undefined) {
      max = Number.MAX_VALUE;
    }


    if (max < min) {
      console.error("Max is < min");
      // If max is 0, then we assume an infinite limit was rather meant.
      if (max === 0) {
        max = Number.MAX_VALUE;
      }
    }

    // We want atleast a maximum value to make a range.
    if (max !== 0) {
      range = {
        min: parseFloat(min),
        max: parseFloat(max)
      };
    }

    return validator.isFloat(parseFloat(val), range);
  };

  // Returns true if the value is a multiple of the given var.
  InputValidation.prototype.isMultipleOf = function(val, multipleof) {
    return (val % multipleof) === 0;
  };

  InputValidation.prototype.validateAsciiStringLength = function(val, minlength, maxlength) {
    // We want to make this is an ascii string:
    var validate = validator.isAscii(val);

    if (minlength === undefined) {
      minlength = 0;
    }

    if (maxlength === undefined) {
      maxlength = 1024;
    }

    validate = validate && validator.isLength(val, {
      min: minlength,
      max: maxlength
    });

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
