from duckduckgo_search import DDGS

def check_methods():
    ddgs = DDGS()
    print(dir(ddgs))

if __name__ == "__main__":
    check_methods()
