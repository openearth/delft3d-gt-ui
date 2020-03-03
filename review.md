# Code review

In this document you'll find comments on general code usage. Unless indicated otherwise all commends should be applied to all files containing the offending pieces of code.

## jQuery Usage

jQuery is used quite a lot throughout the app, mostly to manipulate the DOM. Since this conflicts with the purpose of Vue, it is recomended to phase out the usage of jQuery by using Vue internal functionality.
An example of jQuery usage is the lookup of elements and showing / hiding these elements. Vue features the `v-if`/`v-show` directives. Use these instead of `$('.selector').hide()`.

## Lodash usage

Lodash features quite a lot of functionality. By loading the whole of lodash, the app gets quite a lot of unused javascript code. This adds up quite drastically in the execution time of the application. Fortunatly, Lodash exports all functions as seperate modules. The build in treeshaker of WebPack can extract only what is used.
Instead of `import _ from 'lodash'` consider only importing methods that are actually used:
`import values from 'lodash/values'`

To optimise the build of Lodash even further, consider using this [plugin](https://github.com/lodash/lodash-webpack-plugin)

Favour JavaScripts own functions over Lodash. Although Lodash is realy conveniant to have as a toolbelt, nowadays JavaScript on it's own is almost just as convenient. Functions like `_.map()`, `_.reduce()` can be refactored into their JavaScript equevilant:
* `_.map(arr, fn)` would become `arr.map(fn)`
* `_.reduce(arr, fn, 1)` would become `arr.reduce(fn, 1)`

Have a look at all Lodash functions an determain if it can be replaced by Vanilla JS. This makes the codebase smaller (by not importing Lodash functionality) and reduces the burden on new developers not familiar with Lodash

## Component / View file sizes

Quite a lot of components / views are consderably large in filesize. This does not only make the files harder to read, it makes the project as a whole harder to grasp. Consider to split up components into smaller components and move application logic to a `lib/` folder.

Since the `.vue` file system is used, there is no need to reference the template by id in the script tag

## Store usage

Vuex is a reactive store. Meaning that if a value changes, stuff that listen to that value, also changes. By assigning a store value to a value in the `data` property of a component, that reactiveness is lost. Consider using `mapState` in the `computed` property to remedy this.