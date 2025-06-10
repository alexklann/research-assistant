from fastapi import FastAPI
from dotenv import load_dotenv
from core_api import CoreAPI
from crew import ResearchHelperCrew

load_dotenv()

task_inputs = {
        "paper_content": """The range from a ground tracking station to a
    spacecraft is determined by measuring the round-trip
    time required for a ranging code sequence signal to
    be transmitted from the station to the spacecraft and
    transponded back to the ground station. In typical
    spacecrafts, the ranging transponders demodulate
    and limit the received ranging signal and then re-
    modulate it onto an rf carrier of a different frequency
    for retransmission to the Earth. A major drawback of
    such transponders is that the signal received at Earth
    contains the noise in the signal received by the space-
    craft as well as the noise in the spacecraft's receiver
    and transmitter, together with any noise super-
    imposed on the transponder signal, during its journey
    to Earth. Whenever the up-link ranging channel
    signal-to-noise ratio (SNR) is below unity, most of
    the down-link ranging power is wasted on noise
    rather than on the ranging signal.
    A digital processing system has been developed to
    regenerate the ranging signal in the spacecraft for
    transmission to the ground. The system, called Clean-
    Up-Loop, phase locks on the received ranging signal
    and generates a clean replica of the received ranging
    code. The regenerated ranging signal has no ampli-
    tude noise, except for a small amount of phase jitter,
    corresponding to the phase error in the phase-locked
    regeneration loop; the phase noise can be averaged
    out at the Earth receiver. Because the regenerated
    signal is clean, the increase in down-link SNR is
    approximately equal to the ratio of up-link receiver
    noise to signal.
    The clean-up-loop is designed to operate in con-
    junction with a binary coded sequential-code-com-
    ponent ranging system (s-system) rather than with a
    parallel component pseudonoise (PN) system. In the
    s-system, square waves at successively lower frequen-
    cies are transmitted sequentially; first, the range is
    measured at high resolution, but with 2-microsecond
    ambiguities, using a 500-kHz square wave; then, a
    250-kHz square wave is transmitted so as to eliminate
    half of the ambiguities. Lower and lower frequencies
    are transmitted until all ambiguities are resolved. The
    clean-up-loop transponder operates by phase-locking
    on each code component frequency as it is received
    by the spacecraft; a square wave in phase with the
    received signal is generated for modulation onto the
    down-link carrier for transmission to Earth. Opera-
    tionally, the first square-wave frequency is trans-
    mitted for a time long enough for the clean-up-loop
    to acquire frequency and phase lock, then the trans-
    mitter switches to another frequency, etc.; the clean-
    up-loop must determine when the received signal
    changes the frequency of its square wave component,
    and then it must change the phase-locked loop refer-
    ence signal to track the new component.
    A detailed report is available which systematically
    records the results of a mathematical analysis of the
    Clean-Up-Loop system; the report also includes a
    summary of experimental tests""",
        "authors": "William J . Hurd of",
        "title": "Code-Regenerative Clean-Up Loop for a Ranging Transponder",
        "journal": "NASA TECH BRIEF",
        "year": "1973"
    }

app = FastAPI()
core_api = CoreAPI()

@app.get("/")
async def hello_world():
    return { "message": "Hello from FastAPI!" }

@app.get("/v1/search")
async def search(query: str, page: int = 1):
    """
    Perform a search operation using the provided query string.
    :param query: The search query string.
    :param page: The page number for pagination.
    :return: Search results.
    """
    try:
        results = core_api.search(query, page)
        return results
    except Exception as e:
        return { "error": str(e) }

@app.get("/v1/crew/run")
async def run_crew():
    """
    Run the crew with the provided query.
    :param query: The query to run the crew with.
    :return: The results from the crew.
    """
    try:
        crew = ResearchHelperCrew()
        outputs = crew.run_crew(task_inputs)
        return outputs
    except Exception as e:
        return { "error": str(e) }