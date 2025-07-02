from crewai import Agent, Crew, Process, Task, LLM

class ResearchHelperCrew():
    def __init__(self) -> None:
        self.summarizer_agent = Agent(
            role="Senior Paper Summarizer",
            goal="To summarize research papers and articles effectively, highlighting key findings and contributions.",
            backstory="Your task is to summarize research papers and articles in a concise manner, focusing on the key points and findings. You are an expert in academic writing and can distill complex information into clear summaries.",
            verbose=True,
            allow_delegation=False,
            llm=LLM(
                model="ollama/gemma3:4b",
                base_url="http://localhost:11434",
            )
        )

        self.citator_agent = Agent(
            role="Senior Paper Citator",
            goal="To provide accurate citations for research papers and articles.",
            backstory="Your task is to generate accurate citations for research papers and articles. You are an expert in citation formats and can ensure that all references are correctly formatted.",
            verbose=True,
            allow_delegation=False,
            llm=LLM(
                model="ollama/gemma3:4b",
                base_url="http://localhost:11434",
            )
        )

        self.takeaway_agent = Agent(
            role="Senior Paper Takeaway Generator",
            goal="Summarize the key takeaways of a paper into concise bullet points.",
            backstory="You are an expert at distilling central insights and actionable or learning points from lengthy texts.",
            verbose=True,
            allow_delegation=False,
            llm=LLM(
                model="ollama/gemma3:4b",
                base_url="http://localhost:11434",
            )
)

        self.summarizer_task = Task(
            name="Summarize Research Paper",
            description="Summarize the provided research paper content: {paper_content}",
            expected_output="Short summary of the research paper with max. 100 words, highlighting key findings and contributions. Make it as short as possible while retaining the essence of the paper.",
            agent=self.summarizer_agent,
        )

        self.citator_task = Task(
            name="Create Research Paper Citations",
            description="Generate citations for the provided research paper: {authors}, {title}, {journal}, {year}",
            expected_output="Accurate citations for the research paper, formatted correctly according to this schema: Nachname, Vorname der Autor:in (Jahr): Titel und Untertitel. ggf. Auflage. Verlag.",
            agent=self.citator_agent,
        )

        self.takeaway_task = Task(
            name="Generate Paper Takeaways",
            description="Create a list of the most important takeaways from the following paper content: {paper_content}",
            expected_output="A list of up to 3–5 concise bullet points summarizing the central insights and potential implications.",
            agent=self.takeaway_agent,
        )

        self.crew = Crew(
            agents=[self.summarizer_agent, self.takeaway_agent, self.citator_agent],
            tasks=[self.summarizer_task, self.takeaway_task, self.citator_task],
            verbose=True,
        )
    
    def run_crew(self, inputs):
        """
        Kick off the crew with the provided inputs.
        :param inputs: The inputs for the crew tasks.
        :return: The results from the crew.
        """
        self.crew.kickoff(inputs=inputs)
        summarizer_output = self.summarizer_task.output
        takeaway_output = self.takeaway_task.output
        citator_output = self.citator_task.output
        

        if not summarizer_output or not citator_output or not takeaway_output:
            raise ValueError("Crew did not produce expected outputs.")

        return {
            "summarizer_output": summarizer_output.raw,
            "takeaway_output": takeaway_output.raw,
            "citator_output": citator_output.raw
            
        }