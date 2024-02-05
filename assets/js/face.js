(function ($) {
  $.fn.hoverFlow = function (type, prop, speed, easing, callback) {
    // only allow hover events
    if (
      $.inArray(type, ["mouseover", "mouseenter", "mouseout", "mouseleave"]) ==
      -1
    ) {
      return this;
    }

    // build animation options object from arguments
    // based on internal speed function from jQuery core
    var opt =
      typeof speed === "object"
        ? speed
        : {
            complete:
              callback ||
              (!callback && easing) ||
              ($.isFunction(speed) && speed),
            duration: speed,
            easing:
              (callback && easing) ||
              (easing && !$.isFunction(easing) && easing),
          };

    // run immediately
    opt.queue = false;

    // wrap original callback and add dequeue
    var origCallback = opt.complete;
    opt.complete = function () {
      // execute next function in queue
      $(this).dequeue();
      // execute original callback
      if ($.isFunction(origCallback)) {
        origCallback.call(this);
      }
    };

    // keep the chain intact
    return this.each(function () {
      var $this = $(this);

      // set flag when mouse is over element
      if (type == "mouseover" || type == "mouseenter") {
        $this.data("jQuery.hoverFlow", true);
      } else {
        $this.removeData("jQuery.hoverFlow");
      }

      // enqueue function
      $this.queue(function () {
        // check mouse position at runtime
        var condition =
          type == "mouseover" || type == "mouseenter"
            ? // read: true if mouse is over element
              $this.data("jQuery.hoverFlow") !== undefined
            : // read: true if mouse is _not_ over element
              $this.data("jQuery.hoverFlow") === undefined;

        // only execute animation if condition is met, which is:
        // - only run mouseover animation if mouse _is_ currently over the element
        // - only run mouseout animation if the mouse is currently _not_ over the element
        if (condition) {
          $this.animate(prop, opt);
          // else, clear queue, since there's nothing more to do
        } else {
          $this.queue([]);
        }
      });
    });
  };
})(jQuery);

(function ($) {
  var items = new Array(),
    errors = new Array(),
    onComplete = function () {},
    current = 0;

  var jpreOptions = {
    splashVPos: "35%",
    loaderVPos: "75%",
    splashID: "#jpreContent",
    showSplash: true,
    showPercentage: true,
    debugMode: false,
    splashFunction: function () {},
  };

  var getImages = function (element) {
    $(element)
      .find("*:not(script)")
      .each(function () {
        var url = "";

        if ($(this).css("background-image").indexOf("none") == -1) {
          url = $(this).css("background-image");
          if (url.indexOf("url") != -1) {
            var temp = url.match(/url\((.*?)\)/);
            url = temp[1].replace(/\"/g, "");
          }
        } else if (
          $(this).get(0).nodeName.toLowerCase() == "img" &&
          typeof $(this).attr("src") != "undefined" &&
          $(this).hasClass("preload")
        ) {
          url = $(this).attr("src");
        }
        //console.log(url);

        if (url.length > 0) {
          items.push(url);
        }
      });
  };

  var preloading = function () {
    for (var i = 0; i < items.length; i++) {
      loadImg(items[i]);
    }
  };

  var loadImg = function (url) {
    var imgLoad = new Image();
    $(imgLoad)
      .load(function () {
        completeLoading();
      })
      .error(function () {
        errors.push($(this).attr("src"));
        completeLoading();
      })
      .attr("src", url);
  };

  var completeLoading = function () {
    current++;

    var per = Math.round((current / items.length) * 100);
    $(jBar)
      .stop()
      .animate(
        {
          height: per + "%",
        },
        0,
        "linear"
      ); // changed duration from 500 to zero

    if (jpreOptions.showPercentage) {
      $(jPer).text(per + "%");
    }

    if (current >= items.length) {
      current = items.length;

      if (jpreOptions.debugMode) {
        var error = debug();
      }
      loadComplete();
    }
  };

  var loadComplete = function () {
    $(jBar)
      .stop()
      .animate(
        {
          height: "100%",
        },
        0,
        "linear",
        function () {
          // changed duration from 500 to zero
          $(jOverlay).animate({ opacity: "0" }, 0, function () {
            // changed duration from 500 to zero
            $(jOverlay).remove();
            onComplete();
          });
        }
      );
  };

  var debug = function () {
    if (errors.length > 0) {
      var str = "ERROR - IMAGE FILES MISSING!!!\n\r";
      str += errors.length + " image files cound not be found. \n\r";
      str += "Please check your image paths and filenames:\n\r";
      for (var i = 0; i < errors.length; i++) {
        str += "- " + errors[i] + "\n\r";
      }
      return true;
    } else {
      return false;
    }
  };

  // create the splash screen overlay
  var createContainer = function (tar) {
    jOverlay = $("<div></div>").attr("id", "jpreOverlay").appendTo("body");

    if (jpreOptions.showSplash) {
      jContent = $("<div></div>").attr("id", "jpreSlide").appendTo(jOverlay);

      var conWidth = $(window).width() - $(jContent).width();
      $(jContent).html($(jpreOptions.splashID).wrap("<div/>").parent().html());
      $(jpreOptions.splashID).remove();
      jpreOptions.splashFunction();
    }

    jLoader = $("<div></div>").attr("id", "jpreLoader").appendTo(jOverlay);

    jBar = $("<div></div>").attr("id", "jpreBar").appendTo(jLoader);

    if (jpreOptions.showPercentage) {
      jPer = $("<div></div>")
        .attr("id", "jprePercentage")
        .appendTo(jLoader)
        .html("Loading...");
    }
  };

  $.fn.jpreLoader = function (options, callback) {
    if (options) {
      $.extend(jpreOptions, options);
    }
    if (typeof callback == "function") {
      onComplete = callback;
    }

    createContainer(this);
    getImages(this);
    preloading();
    return this;
  };
})(jQuery);

jQuery.easing["jswing"] = jQuery.easing["swing"];

jQuery.extend(jQuery.easing, {
  def: "easeOutQuad",
  swing: function (x, t, b, c, d) {
    //alert(jQuery.easing.default);
    return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
  },
  easeInQuad: function (x, t, b, c, d) {
    return c * (t /= d) * t + b;
  },
  easeOutQuad: function (x, t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
  },
  easeInOutQuad: function (x, t, b, c, d) {
    if ((t /= d / 2) < 1) return (c / 2) * t * t + b;
    return (-c / 2) * (--t * (t - 2) - 1) + b;
  },
  easeInCubic: function (x, t, b, c, d) {
    return c * (t /= d) * t * t + b;
  },
  easeOutCubic: function (x, t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
  },
  easeInOutCubic: function (x, t, b, c, d) {
    if ((t /= d / 2) < 1) return (c / 2) * t * t * t + b;
    return (c / 2) * ((t -= 2) * t * t + 2) + b;
  },
  easeInQuart: function (x, t, b, c, d) {
    return c * (t /= d) * t * t * t + b;
  },
  easeOutQuart: function (x, t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
  },
  easeInOutQuart: function (x, t, b, c, d) {
    if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t + b;
    return (-c / 2) * ((t -= 2) * t * t * t - 2) + b;
  },
  easeInQuint: function (x, t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b;
  },
  easeOutQuint: function (x, t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
  },
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t /= d / 2) < 1) return (c / 2) * t * t * t * t * t + b;
    return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
  },
  easeInSine: function (x, t, b, c, d) {
    return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b;
  },
  easeOutSine: function (x, t, b, c, d) {
    return c * Math.sin((t / d) * (Math.PI / 2)) + b;
  },
  easeInOutSine: function (x, t, b, c, d) {
    return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;
  },
  easeInExpo: function (x, t, b, c, d) {
    return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
  },
  easeOutExpo: function (x, t, b, c, d) {
    return t == d ? b + c : c * (-Math.pow(2, (-10 * t) / d) + 1) + b;
  },
  easeInOutExpo: function (x, t, b, c, d) {
    if (t == 0) return b;
    if (t == d) return b + c;
    if ((t /= d / 2) < 1) return (c / 2) * Math.pow(2, 10 * (t - 1)) + b;
    return (c / 2) * (-Math.pow(2, -10 * --t) + 2) + b;
  },
  easeInCirc: function (x, t, b, c, d) {
    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
  },
  easeOutCirc: function (x, t, b, c, d) {
    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
  },
  easeInOutCirc: function (x, t, b, c, d) {
    if ((t /= d / 2) < 1) return (-c / 2) * (Math.sqrt(1 - t * t) - 1) + b;
    return (c / 2) * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
  },
  easeInElastic: function (x, t, b, c, d) {
    var s = 1.70158;
    var p = 0;
    var a = c;
    if (t == 0) return b;
    if ((t /= d) == 1) return b + c;
    if (!p) p = d * 0.3;
    if (a < Math.abs(c)) {
      a = c;
      var s = p / 4;
    } else var s = (p / (2 * Math.PI)) * Math.asin(c / a);
    return (
      -(
        a *
        Math.pow(2, 10 * (t -= 1)) *
        Math.sin(((t * d - s) * (2 * Math.PI)) / p)
      ) + b
    );
  },
  easeOutElastic: function (x, t, b, c, d) {
    var s = 1.70158;
    var p = 0;
    var a = c;
    if (t == 0) return b;
    if ((t /= d) == 1) return b + c;
    if (!p) p = d * 0.3;
    if (a < Math.abs(c)) {
      a = c;
      var s = p / 4;
    } else var s = (p / (2 * Math.PI)) * Math.asin(c / a);
    return (
      a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) +
      c +
      b
    );
  },
  easeInOutElastic: function (x, t, b, c, d) {
    var s = 1.70158;
    var p = 0;
    var a = c;
    if (t == 0) return b;
    if ((t /= d / 2) == 2) return b + c;
    if (!p) p = d * (0.3 * 1.5);
    if (a < Math.abs(c)) {
      a = c;
      var s = p / 4;
    } else var s = (p / (2 * Math.PI)) * Math.asin(c / a);
    if (t < 1)
      return (
        -0.5 *
          (a *
            Math.pow(2, 10 * (t -= 1)) *
            Math.sin(((t * d - s) * (2 * Math.PI)) / p)) +
        b
      );
    return (
      a *
        Math.pow(2, -10 * (t -= 1)) *
        Math.sin(((t * d - s) * (2 * Math.PI)) / p) *
        0.5 +
      c +
      b
    );
  },
  easeInBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
  },
  easeOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
  },
  easeInOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    if ((t /= d / 2) < 1)
      return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
    return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
  },
  easeInBounce: function (x, t, b, c, d) {
    return c - jQuery.easing.easeOutBounce(x, d - t, 0, c, d) + b;
  },
  easeOutBounce: function (x, t, b, c, d) {
    if ((t /= d) < 1 / 2.75) {
      return c * (7.5625 * t * t) + b;
    } else if (t < 2 / 2.75) {
      return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
    } else if (t < 2.5 / 2.75) {
      return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
    } else {
      return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
    }
  },
  easeInOutBounce: function (x, t, b, c, d) {
    if (t < d / 2)
      return jQuery.easing.easeInBounce(x, t * 2, 0, c, d) * 0.5 + b;
    return (
      jQuery.easing.easeOutBounce(x, t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b
    );
  },
});

$.fn.fadeSprite = function () {
  this.mouseenter(function (e) {
    $(this).find("a").hoverFlow(e.type, { opacity: 1 }, 300);
  }).mouseleave(function (e) {
    $(this).find("a").hoverFlow(e.type, { opacity: 0 }, 300);
  });
};

/*
 * Function to switch face on browser resize
 */
$.fn.resizeFace = function () {
  $(window).resize(function () {
    var pageWidth = window.innerWidth || document.body.clientWidth;
    //console.log(pageWidth);

    // Show large face
    if (pageWidth >= 1140) {
      $("#designer-img").css({ opacity: "1" });
      $("#coder-img").css({ opacity: "1" });
      $("#designer-bg").css({ opacity: "1" });
      $("#coder-bg").css({ opacity: "1" });
      $("#designer").css({ opacity: "1" });
      $("#coder").css({ opacity: "1" });
    } else {
      // Show smaller face image

      $("#face-img").css({ opacity: "1" });
      $("#designer").css({ opacity: "1" });
      $("#coder").css({ opacity: "1" });
    }
  });
};

/*
 * Function to animate home page
 */
$.fn.animateHome = function () {
  // only animate for large desktop browsers
  var pageWidth = window.innerWidth || document.body.clientWidth;

  if (pageWidth >= 1140) {
    $("#content").animate({ opacity: "1" }, 500, "easeOutExpo");
    $("#designer-img")
      .css({ left: "-500px" })
      .stop()
      .animate({ opacity: "1", left: "100px" }, 1000, "easeOutExpo");
    $("#coder-img")
      .css({ right: "-500px" })
      .stop()
      .animate({ opacity: "1", right: "100px" }, 1000, "easeOutExpo");
    $("#designer-bg")
      .css({ left: "-500px" })
      .stop()
      .animate({ opacity: "1", left: "100px" }, 1500, "easeOutBack");
    $("#coder-bg")
      .css({ right: "-500px" })
      .stop()
      .animate({ opacity: "1", right: "100px" }, 1500, "easeOutBack");
    $("#designer").delay(1500).animate({ opacity: "1" }, 500, "easeOutExpo");
    $("#coder")
      .delay(1500)
      .animate({ opacity: "1" }, 500, "easeOutExpo", function () {
        animateFace();
      });
  } else {
    $("#content").animate({ opacity: "1" }, 500, "easeOutExpo");
    $("#face-img").animate({ opacity: "1" }, 2000, "easeOutExpo");
    $("#designer").delay(1000).animate({ opacity: "1" }, 500, "easeOutExpo");
    $("#coder")
      .delay(1000)
      .animate({ opacity: "1" }, 500, "easeOutExpo", function () {});
  }
};

function animateFace() {
  var designerImg = document.getElementById("designer-img");
  var coderImg = document.getElementById("coder-img");
  var designerDesc = document.getElementById("designer-desc");
  var coderDesc = document.getElementById("coder-desc");
  var designerBg = document.getElementById("designer-bg");
  var coderBg = document.getElementById("coder-bg");
  var face = document.getElementById("face");
  var section = document.getElementById("section");
  var duration = 500;

  var mouseX = 0;
  var relMouseX = 520;
  var xp = 520;
  var loop = 0;
  var frameRate = 30;
  var timeInterval = Math.round(1000 / frameRate);

  section.addEventListener("mouseenter", function (e) {
    // Get mouse position
    section.addEventListener("mousemove", function (e) {
      // raw mouse position
      mouseX = e.pageX;

      // mouse position relative to face div
      relMouseX = mouseX - face.offsetLeft;
    });

    // Animate the face based on mouse movement
    loop = setInterval(function () {
      // zeno's paradox dampens the movement
      xp += (relMouseX - xp) / 20;

      designerImg.style.width = 420 + (520 - xp) * 0.5 + "px";
      designerImg.style.left = 100 + (520 - xp) * 0.1 + "px";
      coderImg.style.width = 420 + (xp - 520) * 0.5 + "px";
      coderImg.style.right = 100 - (520 - xp) * 0.1 + "px";

      designerBg.style.left = 100 + (520 - xp) * 0.05 + "px";
      designerBg.style.opacity = (1040 - xp) / 520;
      coderBg.style.right = 100 + (xp - 520) * 0.05 + "px";
      coderBg.style.opacity = xp / 520;

      designerDesc.style.opacity = (1040 - xp) / 520;
      coderDesc.style.opacity = xp / 520;
    }, timeInterval);
  });

  section.addEventListener("mouseleave", function (e) {
    // reset the face to initial state
    clearInterval(loop);
    xp = 520;
    mouseX = 0;
    relMouseX = 520;

    designerImg.style.width = "420px";
    designerImg.style.left = "100px";
    coderImg.style.width = "420px";
    coderImg.style.right = "100px";

    coderDesc.style.opacity = 1;
    designerDesc.style.opacity = 1;

    coderBg.style.right = "100px";
    coderBg.style.opacity = 1;
    designerBg.style.left = "100px";
    designerBg.style.opacity = 1;
  });
}

// Call the function to initialize the animation
animateFace();

/*
 * Function to animate face
 */
// function animateFace() {
//   var designerImg = $("#designer-img");
//   var coderImg = $("#coder-img");
//   var designerDesc = $("#designer-desc");
//   var coderDesc = $("#coder-desc");
//   var designerBg = $("#designer-bg");
//   var coderBg = $("#coder-bg");
//   var face = $("#face");
//   var section = $("#section");
//   var duration = 500;

//   var mouseX = 0;
//   var relMouseX = 520;
//   var xp = 520;
//   var loop = 0;
//   frameRate = 30;
//   timeInterval = Math.round(1000 / frameRate);

//   section
//     .mouseenter(function (e) {
//       // Get mouse position
//       section.mousemove(function (e) {
//         // raw mouse position
//         mouseX = e.pageX;

//         // mouse position relative to face div
//         relMouseX = mouseX - face.offset().left;
//       });

//       // Animate the face based on mouse movement
//       loop = setInterval(function () {
//         // zeno's paradox dampens the movement
//         xp += (relMouseX - xp) / 20;

//         designerImg.css({
//           width: 420 + (520 - xp) * 0.5,
//           left: 100 + (520 - xp) * 0.1,
//         });
//         coderImg.css({
//           width: 420 + (xp - 520) * 0.5,
//           right: 100 - (520 - xp) * 0.1,
//         });

//         designerBg.css({
//           left: 100 + (520 - xp) * 0.05,
//           opacity: (1040 - xp) / 520,
//         });
//         coderBg.css({
//           right: 100 + (xp - 520) * 0.05,
//           opacity: xp / 520,
//         });
//         designerDesc.css({ opacity: (1040 - xp) / 520 });
//         coderDesc.css({ opacity: xp / 520 });
//       }, timeInterval);
//     })
//     .mouseleave(function (e) {
//       // reset the face to initial state
//       clearInterval(loop);
//       xp = 520;
//       mouseX = 0;
//       relMouseX = 520;

//       designerImg.hoverFlow(
//         e.type,
//         { width: 420, left: 100 },
//         duration,
//         "easeOutQuad"
//       );
//       coderImg.hoverFlow(
//         e.type,
//         { width: 420, right: 100 },
//         duration,
//         "easeOutQuad"
//       );
//       coderDesc.hoverFlow(e.type, { opacity: 1 }, duration, "easeOutQuad");
//       designerDesc.hoverFlow(e.type, { opacity: 1 }, duration, "easeOutQuad");
//       coderBg.hoverFlow(
//         e.type,
//         { right: 100, opacity: 1 },
//         duration,
//         "easeOutQuad"
//       );
//       designerBg.hoverFlow(
//         e.type,
//         { left: 100, opacity: 1 },
//         duration,
//         "easeOutQuad"
//       );
//     });
// }
