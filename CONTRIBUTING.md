# Contributing to Sandlot Sluggers

Thank you for your interest in contributing to Sandlot Sluggers! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the game and community
- Keep content kid-friendly and family-appropriate

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected behavior vs actual behavior
- Screenshots if applicable
- Device/platform information

### Suggesting Features

Feature suggestions are welcome! Please include:
- Clear description of the feature
- Use case and benefits
- How it fits with the game's nostalgic, kid-friendly theme
- Mockups or examples if applicable

### Submitting Code

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Test your changes thoroughly
4. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request**

### Commit Message Guidelines

Use conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

Examples:
- `feat: add new character Speedy Stella`
- `fix: resolve scoring bug in 9th inning`
- `docs: update README with installation instructions`

## Development Guidelines

### Code Style

- Use functional components with React hooks
- Keep components focused and single-purpose
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Follow existing patterns in the codebase

### Testing

- Test on both iOS and Android when possible
- Verify landscape orientation works correctly
- Check touch target sizes (minimum 44x44 points)
- Ensure all game flows work end-to-end
- Test with different character and stadium combinations

### Design Principles

- **Keep it Simple**: Controls should be intuitive
- **Kid-Friendly**: All content appropriate for all ages
- **Colorful**: Maintain vibrant, playful visual style
- **Original**: All content must be original (no copyrighted material)
- **Mobile-First**: Optimize for mobile devices
- **Fun**: Gameplay should be engaging and enjoyable

### Adding New Characters

When adding characters:
1. Add to `src/data/characters.js`
2. Include all required fields
3. Balance stats (total ~25-30 points across all stats)
4. Provide unique personality through funFact and favoriteSnack
5. Choose distinct color that works with UI
6. Keep name and description original and kid-friendly

### Adding New Stadiums

When adding stadiums:
1. Add to `src/data/stadiums.js`
2. Choose colors that work well together
3. Define unique special feature
4. Set appropriate difficulty level
5. Add fun fact for personality
6. Test visual appearance with field rendering

### Adding Game Features

For new game mechanics:
1. Update game logic in `src/utils/gameLogic.js`
2. Ensure backward compatibility
3. Balance with existing mechanics
4. Document new mechanics in DEVELOPMENT.md
5. Consider impact on AI behavior

## Asset Contributions

### Images
- Must be original artwork (no copyrighted material)
- Appropriate resolution for mobile
- Consistent with game's colorful, playful style
- PNG format with transparency where appropriate

### Audio
- Must be original compositions (no copyrighted material)
- Kid-friendly sounds
- Appropriate volume levels
- Format: MP3 or WAV

## Questions?

Feel free to open an issue with the "question" label if you need clarification on anything!

## License

By contributing to Sandlot Sluggers, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make Sandlot Sluggers better! ⚾
