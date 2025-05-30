import os, requests

class CoreAPI:
    """
    The wrapper class for the CORE API.
    """
    def __init__(self):
        assert os.getenv('CORE_API_KEY'), "CORE_API_KEY environment variable is not set"
        self.api_key = os.getenv('CORE_API_KEY')
        self.base_url = "https://api.core.ac.uk/v3"

    def search(self, query: str, page: int = 1):
        """
        Perform a search operation using the provided query string.
        :param query: The search query string.
        :return: Search results.
        """
        PAGE_LENGTH = 10
        limit = page * PAGE_LENGTH
        offset = page * PAGE_LENGTH - PAGE_LENGTH

        response = requests.get(
            f"{self.base_url}/search/works/?q={query}&limit={limit}&offset={offset}",
            headers={"Authorization": f"Bearer {self.api_key}"}   
        )
        if response.status_code != 200:
            raise Exception(f"Error: {response.status_code} - {response.text}")
        return response.json()