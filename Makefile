install: install-deps

install-deps:
	npm ci

test:
	npm test

test_debug:
	npm run test_debug
	
test-coverage:
	npm test -- --coverage

run:
	@echo "Start load page test"
	node bin/page-loader.js --output /var/tmp https://ru.hexlet.io/courses

lint:
	npx eslint .

publish:
	npm publish --dry-run

.PHONY: test