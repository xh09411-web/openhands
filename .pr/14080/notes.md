# PR 14080 QA evidence

## Summary
- Rebasing onto current `main` required merging the new custom-`litellm_proxy/` handling from settings responses.
- The branch now canonicalizes known bare LiteLLM model names for UI/SaaS responses while preserving `litellm_proxy/...` for custom proxy endpoints.

## Local validation
- `poetry run pre-commit run --config ./dev_config/python/.pre-commit-config.yaml --files enterprise/server/routes/users_v1.py enterprise/tests/unit/server/routes/test_users_v1.py openhands/app_server/settings/settings_router.py openhands/utils/llm.py tests/unit/app_server/test_settings_api.py tests/unit/utils/test_llm_utils.py`
- `poetry run pytest tests/unit/app_server/test_settings_api.py tests/unit/utils/test_llm_utils.py -q`

## Notes
- Enterprise-specific pytest for `enterprise/tests/unit/server/routes/test_users_v1.py` was not run locally because the enterprise Poetry environment and its extra dependencies are not installed in this sandbox yet. CI should validate that path on push.
- Follow-up after the first push: enterprise CI wanted `enterprise/tests/unit/server/routes/test_users_v1.py` reformatted; the branch now includes that formatting-only fix and `.pr/14080/logs/enterprise-lint-file.txt` captures a clean rerun with the enterprise pre-commit config.
- Logs are attached in `.pr/14080/logs/`.
