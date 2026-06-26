from core.config import load_config


def test_load_config_reads_env_without_secret_manager():
    cfg = load_config()
    assert cfg.source_bucket == "ignitehealth-rag-source-prod"
    assert cfg.embed_model == "text-embedding-005"
    assert cfg.schema == "rag"
    assert cfg.database_url == "postgresql://u:p@localhost:5432/testdb"
    assert cfg.top_k_kb == 6
    assert cfg.top_k_user == 4
    assert cfg.chunk_max_tokens == 800
    assert abs(cfg.chunk_overlap_ratio - 0.15) < 1e-9
