# Contributor's Manifesto

## Why "Extended"?
The library extension was built for an upcoming product at my full-time job, actually. There are a lot of amazing libraries out there which support dock-like features in the browser, two of which are built specifically for React (this library is one of them!):

- https://github.com/caplin/FlexLayout ([demo](https://rawgit.com/caplin/FlexLayout/demos/demos/v0.30/demo/index.html))

  You're looking at it (or rather, its extension) right now.

- https://github.com/golden-layout/golden-layout ([demo](http://golden-layout.com))

  jQuery dependent, even if you use React.js

- https://github.com/nomcopter/react-mosaic ([demo](https://nomcopter.github.io/react-mosaic))

  It integrates with https://github.com/palantir/blueprint (`react-mosaic` was formerly https://github.com/palantir/react-mosaic; same author!) if you want to use that UI toolkit, really cool; its docking API -- not so much.

- https://github.com/WebCabin/wcDocker ([demo](http://docker.webcabin.org))

  Nice and all, but I can't find any React.js integration docs anywhere. also sadly jQuery-dependent, like `golden-layout`.

- https://github.com/coderespawn/dock-spawn ([demo](http://www.dockspawn.com/))

  Written in Dart. Not what I want.

- https://github.com/phosphorjs/phosphor ([demo](http://phosphorjs.github.io/examples/dockpanel))

  Widget feels really snappy, but I'll have to write my project as a Phosphor.js project first as the main, then React.js in the underlying components. Not what I want.

- [ExtJS `Ext.WindowManager`](https://docs.sencha.com/extjs/6.5.2/classic/Ext.WindowManager.html)

  My colleagues currently use this for **existing** projects only. Not what I want.

In all of my findings, none of them (not even vanilla `FlexLayout`) are even this close to supporting the docking system for my needs: 

- It needs to work in an existing React ecosystem. Therefore, no, I can't use Dart, Phosphor or jQuery.
- It needs to present the widgets like how an IDE does: tabs grouped into tabsets grouped into columns grouped into rows, floating tabsets and then some.
- It needs to be actively maintained, not a 3-year fossil.
- **It needs to be able to fulfill my requirements immediately**

Since I couldn't wait, I went on ahead, studied some of this library's concepts and after quite a handful of hurdles, I (kind of?) got something going here.

## Inspirations

All of this research and development started [here](https://github.com/caplin/FlexLayout/issues/11) and [here](https://github.com/golden-layout/golden-layout/issues/189).

In the later developments of this fork, I also referenced [`re-resizable`](https://github.com/bokuweb/re-resizable) and [`react-rnd`](https://github.com/bokuweb/react-rnd) for the "resize" user action (I use this as a dependency for this library, by the way).
