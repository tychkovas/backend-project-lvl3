install: install-deps

install-deps:
	npm ci

test:
	npm test

test_debug:
	npm run test_debug
	
test-coverage:
	npm test -- --coverage

PATH_OUTPUT = /tmp/save_page
PAGE_ADDRESS = https://ru.hexlet.io/courses

run_mkdir:
	mkdir $(PATH_OUTPUT)

run_clean:
	rm -Rf $(PATH_OUTPUT)/*
	ls -a $(PATH_OUTPUT)

run_load:
	@echo "Start load page. The folder $(PATH_OUTPUT) must exists."
	node bin/page-loader.js --output $(PATH_OUTPUT) $(PAGE_ADDRESS)
	@echo "\nStructure of uploaded files:"
	tree $(PATH_OUTPUT)

run_debug:
	@echo "Start load page in debug mode. The folder $(PATH_OUTPUT) must exists."
	DEBUG=page-loader node bin/page-loader.js --output $(PATH_OUTPUT) $(PAGE_ADDRESS)
	@echo "\nstructure of uploaded files:"
	tree $(PATH_OUTPUT)

run_debug_full:
	@echo "Start load page in full debug mode. The folder $(PATH_OUTPUT) must exists."
	DEBUG=axios,nock.*,page-loader node bin/page-loader.js --output $(PATH_OUTPUT) $(PAGE_ADDRESS)
	@echo "\nStructure of uploaded files:"
	tree $(PATH_OUTPUT)

lint:
	npx eslint .

publish:
	npm publish --dry-run

.PHONY: test