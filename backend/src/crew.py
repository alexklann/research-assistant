# backend/src/crew.py

from crewai import Agent, Crew, Process, Task, LLM

class ResearchHelperCrew():
    def __init__(self) -> None:
        self.search_agent = Agent(
            role="Senior Paper Search Agent",
            goal="Fetch relevant academic papers based on a query, filtering by topic relevance and language (DE/EN).",
            backstory=(
                "Your task is to query an academic search API, retrieve ~30 hits, "
                "filter them by requested language and topic keywords, and return "
                "each entry as title, snippet, URL and language."
            ),
            verbose=True,
            allow_delegation=False,
            llm=LLM(
                model="ollama/gemini3:4b",
                base_url="http://localhost:11434",
            )
        )
        self.search_task = Task(
            name="Search Academic Papers",
            description=(
                "Perform a search with the provided query `{query}` and language `{lang}`. "
                "Return up to 30 results, each as a JSON object with keys "
                "`title`, `snippet`, `link`, `language`."
            ),
            expected_output="[{'title':str,'snippet':str,'link':str,'language':str}]",
            agent=self.search_agent,
        )

        self.summarizer_agent = Agent(
            role="Senior Paper Summarizer",
            goal="To summarize research papers and articles effectively, highlighting key findings and contributions.",
            backstory=(
                "Your task is to summarize research papers and articles in a concise manner, "
                "focusing on the key points and findings. You are an expert in academic writing "
                "and can distill complex information into clear summaries."
            ),
            verbose=True,
            allow_delegation=False,
            llm=LLM(
                model="ollama/gemini3:4b",
                base_url="http://localhost:11434",
            )
        )

        self.citator_agent = Agent(
            role="Senior Paper Citator",
            goal="To provide accurate citations for research papers and articles.",
            backstory=(
                "Your task is to generate accurate citations for research papers and articles. "
                "You are an expert in citation formats and can ensure that all references are correctly formatted."
            ),
            verbose=True,
            allow_delegation=False,
            llm=LLM(
                model="ollama/gemini3:4b",
                base_url="http://localhost:11434",
            )
        )

        self.summarizer_task = Task(
            name="Summarize Research Paper",
            description="Summarize the provided research paper content: {paper_content}",
            expected_output=(
                "Short summary of the research paper with max. 100 words, highlighting key findings "
                "and contributions. Make it as short as possible while retaining the essence of the paper."
            ),
            agent=self.summarizer_agent,
        )

        self.citator_task = Task(
            name="Create Research Paper Citations",
            description="Generate citations for the provided research paper: {authors}, {title}, {journal}, {year}.",
            expected_output=(
                "Accurate citations for the research paper, formatted correctly according "
                "to this schema: Nachname, Vorname der Autor:in (Jahr): Titel und Untertitel, ggf. Auflage. Verlag."
            ),
            agent=self.citator_agent,
        )

        self.crew = Crew(
            agents=[self.search_agent, self.summarizer_agent, self.citator_agent],
            tasks=[self.search_task, self.summarizer_task, self.citator_task],
            verbose=True,
        )

    def run_crew(self, inputs):
        """
        Kick off the crew with the provided inputs.
        :param inputs: The inputs for the crew tasks.
        :return: The results from the crew.
        """
        self.crew.kickoff(inputs=inputs)

        search_output      = self.search_task.output.raw
        summarizer_output = self.summarizer_task.output.raw
        citator_output    = self.citator_task.output.raw

        if not search_output:
            raise ValueError("Search-Agent hat keine Ergebnisse geliefert.")
        if not summarizer_output or not citator_output:
            raise ValueError("Summarizer- oder Citator-Agent hat kein Output produziert.")

        return {
            "search_output"     : search_output,
            "summarizer_output": summarizer_output,
            "citator_output"   : citator_output
        }
