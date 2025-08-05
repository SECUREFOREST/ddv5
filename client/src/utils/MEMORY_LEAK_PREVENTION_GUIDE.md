# Memory Leak Prevention Guide

This guide explains how to properly use the memory leak prevention utilities to avoid React errors and memory leaks.

## Common React Errors and Solutions

### React Error #321
This error typically occurs when:
1. Hooks are called conditionally
2. Hooks are called inside loops or nested functions
3. Hooks are called inside useEffect

**Solution**: Always call hooks at the top level of your component.

## Proper Usage Examples

### ✅ Correct Usage

```jsx
import React from 'react';
import { useTimeout, useEventListener, useComponentLifecycle } from '../utils/memoryLeakPrevention';

function MyComponent() {
  // ✅ Hooks called at top level
  const { clearTimeout } = useTimeout(() => {
    console.log('Timeout executed');
  }, 1000);
  
  const { addEventListener } = useEventListener();
  const { addCleanup } = useComponentLifecycle('MyComponent');
  
  useEffect(() => {
    // ✅ Proper cleanup registration
    const cleanup = () => {
      console.log('Component cleanup');
    };
    
    addCleanup(cleanup);
    
    return () => {
      cleanup();
    };
  }, [addCleanup]);
  
  return <div>My Component</div>;
}
```

### ❌ Incorrect Usage

```jsx
function MyComponent() {
  useEffect(() => {
    // ❌ DON'T call hooks inside useEffect
    const { clearTimeout } = useTimeout(() => {
      console.log('This will cause React Error #321');
    }, 1000);
  }, []);
  
  if (someCondition) {
    // ❌ DON'T call hooks conditionally
    const { addEventListener } = useEventListener();
  }
  
  return <div>My Component</div>;
}
```

## Available Hooks

### useTimeout
Manages timeouts with automatic cleanup.

```jsx
const { clearTimeout } = useTimeout(() => {
  // Your timeout logic
}, 1000);
```

### useInterval
Manages intervals with automatic cleanup.

```jsx
const { clearInterval } = useInterval(() => {
  // Your interval logic
}, 1000);
```

### useEventListener
Manages event listeners with automatic cleanup.

```jsx
const { addEventListener, removeEventListener } = useEventListener();

useEffect(() => {
  const handleClick = () => console.log('Clicked');
  addEventListener(document, 'click', handleClick);
  
  return () => {
    removeEventListener(document, 'click', handleClick);
  };
}, [addEventListener, removeEventListener]);
```

### useComponentLifecycle
Manages component lifecycle with cleanup.

```jsx
const { addCleanup, isMounted } = useComponentLifecycle('MyComponent');

useEffect(() => {
  const cleanup = () => {
    // Cleanup logic
  };
  
  addCleanup(cleanup);
}, [addCleanup]);
```

### useSafeState
Safe state updates that check if component is mounted.

```jsx
const [state, setState] = useSafeState(initialState);
```

## Debugging Utilities

### memoryLeakUtils
```jsx
import { memoryLeakUtils } from '../utils/memoryLeakPrevention';

// Check for potential leaks
memoryLeakUtils.checkForLeaks();

// Get cleanup count
console.log('Active cleanups:', memoryLeakUtils.getCleanupCount());

// Log registry details
memoryLeakUtils.logCleanupRegistry();
```

### useDebugLifecycle
```jsx
import { useDebugLifecycle } from '../utils/memoryLeakPrevention';

function MyComponent() {
  useDebugLifecycle('MyComponent');
  // Component logic
}
```

## Best Practices

1. **Always call hooks at the top level**
2. **Never call hooks inside loops, conditions, or nested functions**
3. **Use the provided hooks instead of native setTimeout/setInterval**
4. **Always provide cleanup functions**
5. **Use useSafeState for state updates in async operations**
6. **Register cleanups with useComponentLifecycle**

## Common Patterns

### Async Operations
```jsx
const [data, setData] = useSafeState(null);
const { isMounted } = useComponentLifecycle('DataComponent');

useEffect(() => {
  const fetchData = async () => {
    const result = await api.getData();
    if (isMounted()) {
      setData(result);
    }
  };
  
  fetchData();
}, [isMounted]);
```

### Event Listeners
```jsx
const { addEventListener, removeEventListener } = useEventListener();

useEffect(() => {
  const handleResize = () => {
    // Handle resize
  };
  
  addEventListener(window, 'resize', handleResize);
  
  return () => {
    removeEventListener(window, 'resize', handleResize);
  };
}, [addEventListener, removeEventListener]);
```

### Timers
```jsx
const { clearTimeout } = useTimeout(() => {
  // Timer logic
}, 5000);

// Clear manually if needed
const handleCancel = () => {
  clearTimeout();
};
```

## Error Handling

The utilities include comprehensive error handling:

- Invalid function parameters are logged as warnings
- Cleanup errors are caught and logged
- WebSocket errors are handled gracefully
- Event listener errors are caught

## Performance Monitoring

Use the debugging utilities to monitor memory usage:

```jsx
// In development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    memoryLeakUtils.checkForLeaks();
  }, 30000); // Check every 30 seconds
}
```

## Migration Guide

### From Native setTimeout
```jsx
// Before
useEffect(() => {
  const timer = setTimeout(() => {
    // Logic
  }, 1000);
  
  return () => clearTimeout(timer);
}, []);

// After
const { clearTimeout } = useTimeout(() => {
  // Logic
}, 1000);
```

### From Native addEventListener
```jsx
// Before
useEffect(() => {
  const handleClick = () => {};
  document.addEventListener('click', handleClick);
  
  return () => {
    document.removeEventListener('click', handleClick);
  };
}, []);

// After
const { addEventListener, removeEventListener } = useEventListener();

useEffect(() => {
  const handleClick = () => {};
  addEventListener(document, 'click', handleClick);
  
  return () => {
    removeEventListener(document, 'click', handleClick);
  };
}, [addEventListener, removeEventListener]);
```

This guide ensures proper usage of memory leak prevention utilities and helps avoid React errors like #321. 