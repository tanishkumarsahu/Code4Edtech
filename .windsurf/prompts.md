# Windsurf AI Prompts and Guidelines

## 🎯 Project Context
This is a **hackathon project** for Theme 2 - AI-powered Resume Relevance Check System. The deadline is **September 21, 2025, 2:00 PM IST**. Every action should prioritize **speed, quality, and hackathon requirements**.

## 🤖 AI Behavior Rules

### 🚨 CRITICAL SERVER MANAGEMENT RULE
**NEVER RESTART THE DEVELOPMENT SERVER UNLESS EXPLICITLY REQUESTED**
- Next.js has hot reload - changes are automatically reflected
- The server runs continuously in the background
- Only restart for .env changes or major configuration updates
- Do NOT run `npm run dev` after every code edit
- Code changes, component updates, and most modifications do NOT require server restart

### Code Generation
When generating code, ALWAYS:
1. **Use TypeScript** - No JavaScript files
2. **Follow modular architecture** - Small, focused components
3. **Add comprehensive error handling** - Try-catch blocks, error boundaries
4. **Include proper types** - Interfaces for all data structures
5. **Add JSDoc comments** - Document functions and components
6. **Implement loading states** - For all async operations
7. **Add accessibility** - ARIA labels, semantic HTML
8. **Optimize performance** - Memoization, lazy loading

### Error Analysis Protocol
When encountering errors, follow this sequence:
1. **Identify the exact error message** and line number
2. **Analyze the root cause** - Don't just fix symptoms
3. **Check related files** - Dependencies, imports, configurations
4. **Verify environment setup** - Node version, dependencies, env vars
5. **Test the fix thoroughly** - Multiple scenarios
6. **Document the solution** - For future reference
7. **Implement prevention** - Add validation, tests, or safeguards

### Code Review Checklist
Before suggesting any code, verify:
- [ ] TypeScript types are correct and complete
- [ ] Error handling covers all edge cases
- [ ] Security best practices followed
- [ ] Performance optimizations applied
- [ ] Accessibility standards met
- [ ] Mobile responsiveness considered
- [ ] Tests can be written for this code
- [ ] Documentation is clear and helpful

## 🏗️ Architecture Patterns

### Component Structure
```typescript
// Always follow this pattern for React components
interface ComponentProps {
  // Define all props with proper types
}

export const ComponentName: React.FC<ComponentProps> = ({ 
  prop1, 
  prop2 
}) => {
  // 1. Hooks at the top
  // 2. State management
  // 3. Event handlers
  // 4. Effects
  // 5. Render logic
  
  return (
    // JSX with proper accessibility
  );
};
```

### Error Handling Pattern
```typescript
// Always wrap async operations
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Unknown error' 
  };
}
```

### API Call Pattern
```typescript
// Consistent API handling
export const apiCall = async <T>(
  endpoint: string, 
  options?: RequestInit
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
};
```

## 🔧 Common Issues and Solutions

### Firebase Authentication Issues
**Problem:** Auth not working
**Root Cause Analysis:**
1. Check Firebase config keys
2. Verify domain in Firebase console
3. Check security rules
4. Validate user permissions

**Solution Pattern:**
```typescript
// Always handle auth states properly
const { user, loading, error } = useAuth();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!user) return <LoginForm />;
```

### Firestore Query Issues
**Problem:** Data not loading
**Root Cause Analysis:**
1. Check security rules
2. Verify collection/document paths
3. Validate query syntax
4. Check user permissions

**Solution Pattern:**
```typescript
// Always handle Firestore operations safely
const fetchData = async () => {
  try {
    const snapshot = await getDocs(query);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return data;
  } catch (error) {
    console.error('Firestore error:', error);
    throw new Error('Failed to fetch data');
  }
};
```

### Next.js Routing Issues
**Problem:** Pages not loading
**Root Cause Analysis:**
1. Check file structure in app directory
2. Verify route naming conventions
3. Check middleware configuration
4. Validate dynamic routes

### State Management Issues
**Problem:** State not updating
**Root Cause Analysis:**
1. Check if state is being mutated directly
2. Verify useEffect dependencies
3. Check component re-render triggers
4. Validate state update patterns

## 📱 Mobile-First Development

Always consider mobile experience:
1. **Touch targets** - Minimum 44px
2. **Responsive breakpoints** - sm, md, lg, xl
3. **Performance** - Optimize for slower networks
4. **Accessibility** - Screen reader support
5. **Gestures** - Swipe, pinch, tap

## 🚀 Performance Optimization

### Automatic Optimizations to Apply:
1. **Image optimization** - Next.js Image component
2. **Code splitting** - Dynamic imports
3. **Memoization** - React.memo, useMemo, useCallback
4. **Lazy loading** - Suspense boundaries
5. **Bundle analysis** - Webpack bundle analyzer

### Database Query Optimization:
1. **Indexing** - Create indexes for frequent queries
2. **Pagination** - Limit results, use cursors
3. **Caching** - Cache frequently accessed data
4. **Batch operations** - Reduce API calls

## 🔒 Security Best Practices

### Always Implement:
1. **Input validation** - Sanitize all user inputs
2. **Authentication checks** - Verify user permissions
3. **HTTPS enforcement** - All communications encrypted
4. **Secret management** - Environment variables only
5. **XSS prevention** - Escape user content
6. **CSRF protection** - Use proper tokens

### Firebase Security:
1. **Security rules** - Restrict database access
2. **Auth verification** - Server-side token validation
3. **Rate limiting** - Prevent abuse
4. **Data validation** - Validate on client and server

## 📝 Documentation Standards

### Code Documentation:
```typescript
/**
 * Calculates resume relevance score based on job description
 * @param resume - Parsed resume data
 * @param jobDescription - Job requirements and description
 * @returns Promise<RelevanceScore> - Score between 0-100 with breakdown
 * @throws {Error} When resume or job description is invalid
 */
export const calculateRelevanceScore = async (
  resume: ParsedResume,
  jobDescription: JobDescription
): Promise<RelevanceScore> => {
  // Implementation
};
```

### Component Documentation:
```typescript
/**
 * ResumeUpload Component
 * 
 * Handles file upload for PDF/DOCX resumes with validation
 * Provides real-time upload progress and error handling
 * 
 * @example
 * <ResumeUpload 
 *   onUploadComplete={handleUpload}
 *   maxFileSize={10 * 1024 * 1024}
 * />
 */
```

## 🎯 Hackathon-Specific Guidelines

### Priority Order:
1. **Core functionality** - Resume upload, analysis, scoring
2. **User authentication** - Firebase Auth integration
3. **Dashboard** - Basic recruiter interface
4. **Feedback system** - Student improvement suggestions
5. **Advanced features** - Filtering, analytics, exports

### Time Management:
- **Day 1 (Sep 20):** Setup, auth, basic UI, file upload
- **Day 2 Morning:** Core analysis, dashboard, integration
- **Day 2 Afternoon:** Testing, deployment, video creation

### Quality vs Speed:
- **Must have:** Working core features, proper error handling
- **Should have:** Good UI/UX, comprehensive testing
- **Nice to have:** Advanced analytics, beautiful animations

## 🚨 Emergency Debugging Protocol

When critical errors occur:
1. **Stop and analyze** - Don't rush to fix
2. **Check the basics** - Imports, syntax, types
3. **Isolate the problem** - Comment out code sections
4. **Check dependencies** - Version conflicts, missing packages
5. **Verify environment** - Node version, env vars, Firebase config
6. **Test incrementally** - Add code back piece by piece
7. **Document the fix** - Prevent future occurrences

## 📊 Success Metrics

### Code Quality:
- TypeScript coverage: 100%
- ESLint errors: 0
- Test coverage: >80%
- Performance score: >90

### User Experience:
- Loading time: <3 seconds
- Mobile responsive: 100%
- Accessibility score: >95
- Error handling: Comprehensive

### Hackathon Requirements:
- All deliverables: ✅
- Timeline adherence: ✅
- Technical requirements: ✅
- Demo readiness: ✅

---

**Remember: Every line of code should be production-ready, well-documented, and thoroughly tested. The hackathon timeline is tight, but quality cannot be compromised.**
