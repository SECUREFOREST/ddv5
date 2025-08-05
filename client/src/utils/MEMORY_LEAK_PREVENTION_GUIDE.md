# Memory Leak Prevention Guide

This guide outlines the memory leak prevention strategies implemented in this React application and provides best practices for developers.

## Common Memory Leak Sources

### 1. Timers and Intervals
**Problem**: `setTimeout` and `setInterval` not being cleared
**Solution**: Use the `useInterval` and `useTimeout` hooks

```javascript
// ❌ Bad - potential memory leak
useEffect(() => {
  const interval = setInterval(() => {
    // do something
  }, 1000);
  // Missing cleanup
}, []);

// ✅ Good - memory safe
useInterval(() => {
  // do something
}, 1000);
```

### 2. Event Listeners
**Problem**: Event listeners not being removed
**Solution**: Use the `useEventListener` hook

```javascript
// ❌ Bad - potential memory leak
useEffect(() => {
  const handleClick = () => {};
  document.addEventListener('click', handleClick);
  // Missing cleanup
}, []);

// ✅ Good - memory safe
const { addEventListener, removeEventListener } = useEventListener();
useEffect(() => {
  const handleClick = () => {};
  addEventListener(document, 'click', handleClick);
  return () => removeEventListener(document, 'click', handleClick);
}, [addEventListener, removeEventListener]);
```

### 3. WebSocket Connections
**Problem**: WebSocket connections not being closed
**Solution**: Use the `useWebSocket` hook

```javascript
// ❌ Bad - potential memory leak
useEffect(() => {
  const socket = new WebSocket(url);
  // Missing cleanup
}, []);

// ✅ Good - memory safe
const { connect, disconnect } = useWebSocket();
useEffect(() => {
  connect(url, {
    onMessage: handleMessage,
    onError: handleError
  });
  return () => disconnect();
}, [connect, disconnect]);
```

### 4. Subscriptions
**Problem**: Subscriptions not being unsubscribed
**Solution**: Use the `useSubscription` hook

```javascript
// ❌ Bad - potential memory leak
useEffect(() => {
  const subscription = someService.subscribe(callback);
  // Missing cleanup
}, []);

// ✅ Good - memory safe
const { subscribe } = useSubscription();
useEffect(() => {
  const unsubscribe = subscribe(someService.subscribe(callback));
  return unsubscribe;
}, [subscribe]);
```

## Memory-Safe Hooks

### useInterval
Automatically cleans up intervals when component unmounts or dependencies change.

```javascript
import { useInterval } from '../utils/memoryLeakPrevention';

function MyComponent() {
  const [count, setCount] = useState(0);
  
  useInterval(() => {
    setCount(c => c + 1);
  }, 1000); // Runs every second, automatically cleaned up
  
  return <div>{count}</div>;
}
```

### useTimeout
Automatically cleans up timeouts when component unmounts or dependencies change.

```javascript
import { useTimeout } from '../utils/memoryLeakPrevention';

function MyComponent() {
  const [showMessage, setShowMessage] = useState(false);
  
  useTimeout(() => {
    setShowMessage(true);
  }, 2000); // Shows message after 2 seconds, automatically cleaned up
  
  return showMessage ? <div>Hello!</div> : null;
}
```

### useEventListener
Manages event listeners with automatic cleanup.

```javascript
import { useEventListener } from '../utils/memoryLeakPrevention';

function MyComponent() {
  const { addEventListener, removeEventListener } = useEventListener();
  
  useEffect(() => {
    const handleResize = () => {
      // Handle resize
    };
    
    addEventListener(window, 'resize', handleResize);
    return () => removeEventListener(window, 'resize', handleResize);
  }, [addEventListener, removeEventListener]);
  
  return <div>Resize me</div>;
}
```

### useWebSocket
Manages WebSocket connections with automatic cleanup.

```javascript
import { useWebSocket } from '../utils/memoryLeakPrevention';

function MyComponent() {
  const { connect, disconnect, send } = useWebSocket();
  
  useEffect(() => {
    connect('ws://localhost:8080', {
      onMessage: (data) => console.log(data),
      onError: (error) => console.error(error)
    });
    
    return () => disconnect();
  }, [connect, disconnect]);
  
  return <div>WebSocket connected</div>;
}
```

### useComponentLifecycle
Manages component lifecycle with cleanup tracking.

```javascript
import { useComponentLifecycle } from '../utils/memoryLeakPrevention';

function MyComponent() {
  const { addCleanup, isMounted } = useComponentLifecycle('MyComponent');
  
  const handleAsyncOperation = async () => {
    const result = await someAsyncOperation();
    if (isMounted()) {
      // Only update state if component is still mounted
      setState(result);
    }
  };
  
  useEffect(() => {
    const cleanup = () => {
      // Custom cleanup logic
    };
    
    addCleanup(cleanup);
  }, [addCleanup]);
  
  return <div>Component with lifecycle management</div>;
}
```

## Best Practices

### 1. Always Clean Up Resources
```javascript
// ✅ Always return cleanup function from useEffect
useEffect(() => {
  const subscription = service.subscribe(callback);
  return () => subscription.unsubscribe();
}, []);
```

### 2. Check if Component is Mounted
```javascript
// ✅ Check if component is still mounted before updating state
const { isMounted } = useComponentLifecycle('MyComponent');

const handleAsyncOperation = async () => {
  const result = await apiCall();
  if (isMounted()) {
    setState(result);
  }
};
```

### 3. Use Memory-Safe Hooks
```javascript
// ✅ Use memory-safe hooks instead of manual cleanup
useInterval(() => {
  // This will be automatically cleaned up
}, 1000);
```

### 4. Register Cleanup Functions
```javascript
// ✅ Register cleanup functions for debugging
import { registerCleanup } from '../utils/memoryLeakPrevention';

useEffect(() => {
  const cleanup = () => {
    // Cleanup logic
  };
  
  registerCleanup(cleanup, 'MyComponent');
  return cleanup;
}, []);
```

## Debugging Memory Leaks

### 1. Check Cleanup Registry
```javascript
import { memoryLeakUtils } from '../utils/memoryLeakPrevention';

// Log current cleanup registry
memoryLeakUtils.logCleanupRegistry();

// Get number of registered cleanups
console.log(memoryLeakUtils.getCleanupCount());
```

### 2. Force Cleanup
```javascript
// Force cleanup of all registered cleanups
memoryLeakUtils.forceCleanup();
```

### 3. Browser DevTools
- Use Chrome DevTools Memory tab
- Take heap snapshots before and after component unmounts
- Look for detached DOM trees and event listeners

## Common Patterns to Avoid

### ❌ Don't Create Timers Without Cleanup
```javascript
useEffect(() => {
  setInterval(() => {
    // This will leak memory
  }, 1000);
}, []);
```

### ❌ Don't Add Event Listeners Without Cleanup
```javascript
useEffect(() => {
  window.addEventListener('resize', handleResize);
  // Missing removeEventListener
}, []);
```

### ❌ Don't Create Subscriptions Without Cleanup
```javascript
useEffect(() => {
  const subscription = service.subscribe(callback);
  // Missing subscription.unsubscribe()
}, []);
```

### ❌ Don't Update State After Component Unmount
```javascript
const handleAsyncOperation = async () => {
  const result = await apiCall();
  setState(result); // This might cause memory leaks
};
```

## Migration Guide

### From Manual Timers to useInterval
```javascript
// Before
useEffect(() => {
  const interval = setInterval(callback, 1000);
  return () => clearInterval(interval);
}, [callback]);

// After
useInterval(callback, 1000);
```

### From Manual Event Listeners to useEventListener
```javascript
// Before
useEffect(() => {
  const handleClick = () => {};
  document.addEventListener('click', handleClick);
  return () => document.removeEventListener('click', handleClick);
}, []);

// After
const { addEventListener, removeEventListener } = useEventListener();
useEffect(() => {
  const handleClick = () => {};
  addEventListener(document, 'click', handleClick);
  return () => removeEventListener(document, 'click', handleClick);
}, [addEventListener, removeEventListener]);
```

## Performance Monitoring

### 1. Monitor Memory Usage
```javascript
// Log memory usage periodically
setInterval(() => {
  if (performance.memory) {
    console.log('Memory usage:', performance.memory);
  }
}, 10000);
```

### 2. Monitor Cleanup Registry
```javascript
// Log cleanup registry size
setInterval(() => {
  console.log('Cleanup registry size:', memoryLeakUtils.getCleanupCount());
}, 5000);
```

### 3. Monitor Component Lifecycle
```javascript
// Log component mount/unmount
const { addCleanup } = useComponentLifecycle('MyComponent');

useEffect(() => {
  console.log('Component mounted');
  addCleanup(() => console.log('Component unmounted'));
}, [addCleanup]);
```

## Conclusion

By following these patterns and using the provided memory-safe hooks, you can significantly reduce the risk of memory leaks in your React application. Always remember to:

1. Use memory-safe hooks instead of manual cleanup
2. Check if components are mounted before updating state
3. Register cleanup functions for debugging
4. Monitor memory usage and cleanup registry
5. Follow the best practices outlined in this guide

The memory leak prevention utilities provide a robust foundation for building memory-efficient React applications. 