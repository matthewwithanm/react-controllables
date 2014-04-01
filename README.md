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

1. Include the ControllablesMixin
2. Specify state variables that can be controllable by adding a `controllables`
   array to your spec.
3. Modify your component to use `this.getControllableValue()` instead of
   `this.state` whenever you're reading state values.


Example
-------

We'll use our TabBar example and represent its state as an integer corresponding
to the selected tab named "selectedTabIndex".

```jsx
var TabBar = React.createClass({
  displayName: 'TabBar',
  mixins: [ControllablesMixin],
  controllables: ['selectedTabIndex'],
  getDefaultProps: function() {
    // Instead of using `getInitialState` to provide a default value, use
    // `getDefaultProps` and prepend "default" to your variable name. (This is
    // like "defaultValue" on `<input>`s.)
    return {
      defaultSelectedTabIndex: 0
    }
  },
  render: function() {
    // Use `this.getControllableValue` instead of `this.state` for accessing
    // state.
    var selectedTabIndex = this.getControllableValue('selectedTabIndex');
    return (
      <ul>
        <li className={ selectedTabIndex == 0 ? 'selected' }>Tab Zero!</li>
        <li className={ selectedTabIndex == 1 ? 'selected' }>Tab One!</li>
        <li className={ selectedTabIndex == 2 ? 'selected' }>Tab Two!</li>
      </ul>
    );
  }
});
```

Now we can use our TabBar like we used to, and have it manage its own state:

```jsx
<TabBar />
```

We can specify a value for it to start with:

```jsx
<TabBar defaultSelectedTabIndex={ 2 } />
```

Or we can make it a *controlled* component and manage the state at a higher
level:

```jsx
var App = React.createClass({
  getInitialState: function() {
    return {
      tabNum: 0
    }
  },
  handleTabChange: function(newValue) {
    this.setState({tabNum: newValue});
  },
  render: function() {
    return (
      <TabBar
        selectedTabIndex={ this.state.tabNum }
        onSelectedTabIndexChange={ this.handleTabChange } />
    );
  }
});
```

(Callbacks are added by the ControllablesMixin using the convention
"on<Name>Change".)


Advanced
--------

Unlike React inputs, components built with the ControllablesMixin can't really
be said to be either "controlled" or "uncontrolled" generally. That's because a
single component can have both controlled and uncontrolled values. For example,
consider this variation of our TabBar:

```jsx
var TabBar = React.createClass({
  displayName: 'TabBar',
  mixins: [ControllablesMixin],
  controllables: ['selectedTabIndex', 'color'],
  .
  .
  .
```

We could have both "selectedTabIndex" and "color" be controlled:

```jsx
<TabBar selectedTabIndex={ 2 } color={ 'blue' } />
```

Or neither:

```jsx
<TabBar defaultSelectedTabIndex={ 2 } />
```

(Remember, default values don't make a component controlled, they just set the
initial internal state.)

Or only one!

```jsx
<TabBar color={ 'blue' } />
```


[1]: http://facebook.github.io/react/docs/forms.html#controlled-components
