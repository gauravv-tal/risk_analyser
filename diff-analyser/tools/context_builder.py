import ast

def extract_imports_from_code(code):
    try:
        node = ast.parse(code)
        imports = []
        for n in ast.walk(node):
            if isinstance(n, ast.Import):
                imports += [a.name for a in n.names]
            elif isinstance(n, ast.ImportFrom) and n.module:
                imports.append(n.module)
        return imports
    except Exception:
        return []

def build_context_from_files(file_dict):
    # file_dict: {"path/to/file.py": "code string"}
    context = {"dependencies": {}, "test_coverage": {}}
    for path, code in file_dict.items():
        imports = extract_imports_from_code(code)
        context["dependencies"][path] = imports
        context["test_coverage"][path] = ["tests/test_" + path.split("/")[-1]]  # naive
    return context
