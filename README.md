# delft3d-gt-ui


[![Build Master](https://travis-ci.org/openearth/delft3d-gt-ui.svg?branch=master)](https://travis-ci.org/openearth/delft3d-gt-ui)

[![Build Develop](https://travis-ci.org/openearth/delft3d-gt-ui.svg?branch=develop)](https://travis-ci.org/openearth/delft3d-gt-ui)


Frontend for the Delft3D GT web-based user interface

# Getting Started

#### Install gulp, bower and the latest version of npm and a few test scripts globally:

```sh
$ npm install --global npm
$ npm install --global bower
$ npm install --global gulp
$ npm install --global eslint
$ npm install --global mocha
```

You can also install scss_lint if you want to check the stylesheets
```sh
$ gem install scss_lint
```

#### Install packages a
```sh
$ npm install
$ bower install
```

#### Run gulp:

Serve a local development website:
```sh
$ gulp serve
```

Build a static website:
```sh
$ gulp
```

Run the tests
```sh
$ gulp test
```

Run the ui tests
```sh
$ gulp serve:test
```

Inject dependencies in the html pages:
```sh
$ gulp wiredep
```

Check the javascript:
```sh
$ gulp lint
```

Check the stylesheets:
```sh
$ gulp lint:scss
```

Check the tests:
```sh
$ gulp lint:test
```


For development the [gitflow](http://nvie.com/posts/a-successful-git-branching-model) branching model is used.
