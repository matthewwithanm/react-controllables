react-controllables
===================

Easily create controllable components

If you've worked with forms in ReactJS, you're probably familiar with the idea
of [controlled and uncontrolled components][1]. Put simply, controlled
components have their state controlled by another component whereas uncontrolled
components manage their own state. It turns out that this idea can be really
useful for custom components too.


Use Case
--------

Imagine you've designed a TabBar component. When you click on a tab, it becomes
selected and the other tabs in the bar become deselected. The selected tab is
stored as state in the component. (As a pleasant side-effect, this makes it nice
and easy to demo in isolation.)

Everything is fine until one day when the designer of your site decides to add
another component to the page that also changes the selected tab. Now you've got
a problem: you need to hoist the state to a higher level so it can be shared
between the two components.

Instead of ripping out the state management from your TabBar component (which
would make it impossible to play with the component on a page by itself), make
it *controllable*.


How
---

1. Write a "dumb" component that doesn't manage its state at all but accepts one
   or more props and corresponding `onPROPNAMEChange` callbacks.
2. Use `controllable` to create a higher-order component from the dumb one.

<small><i>
  Note: There's one exception to the `onPROPNAMEChange` convention: if the prop
  name is "value," the callback will be simply "onChange". This is done to match
  the conventions in React itself.
</i></small>

<small><i>
  Note: react-controllables used to be implemented with a mixin and have a
  different (more complicated!) usage. The mixin is still included at
  <code>react-controllables/mixin</code> (or <code>Controllables.Mixin</code> in
  the standalone build) but deprecated. Switch!
</i></small>


Example
-------

We'll use our TabBar example and represent the selection as an integer using the
selectedTabIndex prop.

```jsx
class TabBar extends React.Component {

  render() {
    var selectedTabIndex = this.props.selectedTabIndex;
    return (
      <ul onClick={ this.handleClick.bind(this) }>
        <li className={ selectedTabIndex == 0 ? 'selected' : '' }>Tab Zero!</li>
        <li className={ selectedTabIndex == 1 ? 'selected' : '' }>Tab One!</li>
        <li className={ selectedTabIndex == 2 ? 'selected' : '' }>Tab Two!</li>
      </ul>
    );
  }

  handleClick(event) {
    // Call the `onSelectedTabIndexChange` callback with the new value.
    if (!this.props.onSelectedTabIndexChange) return;
    var el = event.target;
    var index = Array.prototype.indexOf.call(el.parentNode.children, el);
    this.props.onSelectedTabIndexChange(index);
  }

}

TabBar.defaultProps = {selectedTabIndex: 0};

TabBar.propTypes = {
  selectedTabIndex: PropTypes.number.isRequired,
  onSelectedTabIndexChange: PropTypes.func,
};
```

Next, use the controllable util to create a higher-order component, telling it
which props you want to be managed.

```jsx
import controllable from 'react-controllables';
TabBar = controllable(TabBar, ['selectedTabIndex']);
```

We now have a TabBar component that can store its own state OR be controlled!
Just use it like normal:

```jsx
<TabBar />
```

We can specify a value for it to start with using `defaultPROPNAME`:

```jsx
<TabBar defaultSelectedTabIndex={ 2 } />
```

Or we can make it a *controlled* component and manage the state at a higher
level:

```jsx
<TabBar
  selectedTabIndex={ indexFromSomewhereElse }
  onSelectedTabIndexChange={ handler } />
```

Unlike React inputs, components built with react-controllables can't really be
said to be either "controlled" or "uncontrolled" generally. That's because a
single component can have both controlled and uncontrolled values. For example,
consider this variation of our TabBar:

```jsx
TabBar = controllable(TabBar, ['selectedTabIndex', 'color']);
```

We could have both "selectedTabIndex" and "color" be controlled:

```jsx
<TabBar selectedTabIndex={ 2 } color="blue" />
```

Or neither:

```jsx
<TabBar defaultSelectedTabIndex={ 2 } />
```

(Remember, default values don't make a component controlled, they just set the
initial internal state.)

Or only one!

```jsx
<TabBar color="blue" />
```


Reducers
--------

In the examples above, the value passed to the the `onPROPNAMEChange` callback
was then just passed back to the dumb component as a prop. However, sometimes
calculating state depends on the current state. In those cases, you can pass
`controllable` a map of reducer functions for determining the new state. For
example, a counter:

```js
@controllable({
  add: (currentProps, delta) => ({count: currentProps.count + delta}),
})
class Counter extends React.Component {

  static propTypes = {
    count: React.PropTypes.number,
    add: React.PropTypes.func,
  }

  static defaultProps = {
    count: 0,
  }

  render() {
    return (
      <div>
        <div onClick={this.props.add(1)}>+</div>
        <div onClick={this.props.add(-1)}>-</div>
        <div>Current: {this.props.count}</div>
      </div>
    );
  }
}
```

Here, the `add` function will control the local state of the wrapping component.
Clicking on the + and - buttons will cause it to be called with the current
props and either a `1` or `-1`. (This is similar to a bound action creator in
Redux.) The result will be used to update the state. If an `onCountChange`
callback was passed to your component, it will automatically be called with the
new value.

You can think of this as adding a lightweight, optional store to your component
that only gets used when the component is "uncontrolled."


Decorator Support
-----------------

The react-controllables API is also designed to work with [JavaScript decorator
proposal]. Decorators provide a very elegant way to use react-controllables (and
higher-order components in general) if you're using a transpiler that supports
them, like [Babel 5.0 or greater][2]:

```jsx
@controllable(['selectedTabIndex', 'color'])
class TabBar extends React.Component {

  // [SNIP] Body same as above.

}
```


[1]: http://facebook.github.io/react/docs/forms.html#controlled-components
[JavaScript decorator proposal]: https://github.com/wycats/javascript-decorators
[2]: http://babeljs.io/blog/2015/03/31/5.0.0/#stage-1:-decorators
