// generated on 2016-01-18 using generator-gulp-webapp 1.1.1
// native nodejs
import del from "del";

// gulp stuff
import gulp from "gulp";
import mocha from "gulp-mocha";
import scsslint from "gulp-scss-lint";
import concat from "gulp-concat";
import gulpLoadPlugins from "gulp-load-plugins";
import istanbul from "gulp-istanbul";

import mainBowerFiles from "gulp-main-bower-files";

// other stuff
import {stream as wiredep} from "wiredep";
import browserSync from "browser-sync";
import proxyMiddleware from "http-proxy-middleware";
import _ from "lodash";

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

var args = require("yargs").argv;
// Server used for serving remote url"s
// "http://136.231.10.175:8888";
var apiServer = "";

// Process optional arguments
processOptionalArguments();

// Proxy paths which we map to a different source, for testing locally or
// running the actual build.
var paths = ["runs", "createrun", "deleterun", "dorun", "scene", "files", "scenario", "scenario/template"];

var proxies = _.map(paths, (path) => {
  var proxyItem = null;

  if (apiServer) {
    proxyItem = proxyMiddleware("/" + path, {target: apiServer});
  }

  return proxyItem;
});

// Function to process the optional arguments
function processOptionalArguments() {
  "use strict";
  // apiServer argument
  if (args.apiServer) {
    apiServer = args.apiServer;
  }
}


gulp.task("styles", () => {
  return gulp.src("app/styles/*.scss")
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: "expanded",
      precision: 10,
      includePaths: ["."]
    }).on("error", $.sass.logError))
    .pipe($.autoprefixer({browsers: ["> 1%", "last 2 versions", "Firefox ESR"]}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(".tmp/styles"))
    .pipe(reload({stream: true}));
});

gulp.task("scripts", () => {
  return gulp.src([
    "app/scripts/**/*.js"
  ])
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write("."))
    .pipe(gulp.dest(".tmp/scripts"))
    .pipe(reload({stream: true}));
});

function lint(files, options) {
  "use strict";
  return () => {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}
// some extra options for tests
const testLintOptions = {
  env: {
    mocha: true
  }
};
const es6LintOptions = {
  extends: "eslint:recommended",
  baseConfig: {
    parser: "babel-eslint"
  },
  ecmaFeatures: {
    "modules": true
  },
  env: {
    es6: true
  }
};

gulp.task("lint", lint("app/scripts/**/*.js"));

gulp.task("lint:test",
          lint([
            "test/spec/**/*.js"
          ], testLintOptions)
         );
gulp.task("lint:babel",
          lint([
            "gulpfile.babel.js"
          ], es6LintOptions)
         );


gulp.task("lint:scss", () => {
  return gulp.src("app/styles/*.scss")
    .pipe(scsslint());
});

gulp.task("test", ["scripts", "lint", "lint:test"], () => {
  return gulp.src("test/spec/**/*.js")
    .pipe(mocha({}));
});

gulp.task("pre-coverage", () => {
  return gulp.src(["app/**/*.js"])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task("coverage", ["pre-coverage"], () => {
  return gulp.src(["test/**/*.js"])
    .pipe(mocha({reporter: "mocha-teamcity-reporter"}))
  // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
  // Enforce a coverage of at least 90%
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 20 } }));
});

gulp.task("teamcity", ["scripts", "lint", "lint:test", "lint:scss", "coverage"], () => {
  // Just run all the dependencies.
});

gulp.task("html", ["styles", "scripts"], () => {
  return gulp.src("app/*.html")
    .pipe($.useref({searchPath: [".tmp", "app", "."]}))
    .pipe($.if("*.js", $.uglify()))
    .pipe($.if("*.css", $.cssnano()))
    .pipe($.if("*.html", $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest("dist"));
});

gulp.task("templates", [], () => {
  return gulp.src("app/templates/*.html")
    .pipe($.htmlmin({collapseWhitespace: true}))
    .pipe(concat("templates.html"))
  // this is used in serve and in build
    .pipe(gulp.dest(".tmp/templates"))
    .pipe(gulp.dest("dist/templates"));
});


gulp.task("images", () => {
  return gulp.src("app/images/**/*")
    .pipe($.if(
      $.if.isFile,
      $.cache(
        $.imagemin({
          progressive: true,
          interlaced: true,
          // don"t remove IDs from SVGs, they are often used
          // as hooks for embedding and styling
          svgoPlugins: [{cleanupIDs: false}]
        })
      )
        .on("error", (err) => {
          console.log(err);
          this.end();
        })))
    .pipe(gulp.dest("dist/images"));
});

gulp.task("fonts", () => {
  return gulp.src(
    // load from bower files
    require("main-bower-files")("**/*.{eot,svg,ttf,woff,woff2}")
      .concat("app/fonts/**/*"))
    .pipe(gulp.dest(".tmp/fonts"))
    .pipe(gulp.dest("dist/fonts"));
});

gulp.task("extras", () => {
  return gulp.src([
    "app/*.*",
    "!app/*.html"
  ], {
    dot: true
  }).pipe(gulp.dest("dist"));
});

gulp.task("clean", del.bind(null, [".tmp", "dist"]));

gulp.task("serve", ["styles", "scripts", "fonts", "images", "templates"], () => {
  var options = {
    notify: false,
    port: 9000,
    server: {
      baseDir: [".tmp", "app"],
      routes: {
        "/bower_components": "bower_components"
      }

    }
  };

  // apiServer cannot be zero length, then the "target" parameter is not valid.
  // so we only add the proxy if the length is not zero
  if (apiServer) {
    options.middleware = proxies;
  }

  browserSync(options);

  gulp.watch([
    "app/*.html",
    "app/templates/*.html",
    ".tmp/scripts/**/*.js",
    "app/images/**/*",
    ".tmp/fonts/**/*"
  ]).on("change", reload);

  // Also watch templates.
  gulp.watch("app/templates/*.html", ["templates"]);
  gulp.watch("app/styles/**/*.scss", ["styles"]);
  gulp.watch("app/scripts/**/*.js", ["scripts"]);
  gulp.watch("app/fonts/**/*", ["fonts"]);
  gulp.watch("bower.json", ["wiredep", "fonts"]);
});

gulp.task("serve:dist", () => {
  var options = {
    notify: false,
    port: 9000,
    server: {
      baseDir: ["dist"]
    }
  };

  // apiServer cannot be zero length, then the "target" parameter is not valid.
  // so we only add the proxy if the length is not zero
  if (apiServer)  {
    options.middleware = proxies;
  }

  browserSync(options);
});

gulp.task("serve:test", ["scripts", "templates"], () => {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: "test",
      routes: {
        "/scripts": ".tmp/scripts",
        "/bower_components": "bower_components"
      }
    }
  });

  gulp.watch("app/templates/**/*.html", ["templates"]);
  gulp.watch("app/images/**/*", ["images"]);
  gulp.watch("app/scripts/**/*.js", ["scripts"]);
  gulp.watch("test/spec/**/*.js").on("change", reload);
  gulp.watch("test/spec/**/*.js", ["lint:test"]);
});

// inject bower components
gulp.task("wiredep", () => {
  gulp.src("app/styles/*.scss")
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest("app/styles"));

  gulp.src("app/*.html")
    .pipe(wiredep({
      exclude: ["bootstrap-sass"],
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest("app"));
  gulp.src("test/index.html")
    .pipe(wiredep({
      exclude: ["bootstrap-sass"],
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest("test"));

});

gulp.task("build", ["lint", "html", "images", "fonts", "extras", "templates"], () => {
  return gulp.src("dist/**/*").pipe($.size({title: "build", gzip: true}));
});

gulp.task("default", ["clean"], () => {
  gulp.start("build");
});
