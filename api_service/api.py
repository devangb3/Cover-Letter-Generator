import logging
import os
import traceback

from flask import Flask, jsonify, request
from flask_cors import CORS

from api_service.ai_service import generate_cover_letter, generate_job_question_answers
from api_service.model_config import get_default_model, get_models, is_allowed_model, load_model_config

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("api_service.log"),
    ],
)
logger = logging.getLogger("api_service")

app = Flask(__name__)
CORS(app)

load_model_config()

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    logger.warning("OPENROUTER_API_KEY not set in environment")


@app.route("/models", methods=["GET"])
def models():
    try:
        return jsonify(
            {
                "models": get_models(),
                "defaultModel": get_default_model(),
            }
        ), 200
    except Exception as exc:
        logger.error(f"Error loading model catalog: {exc}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(exc)}), 500


@app.route("/process", methods=["POST"])
def process():
    try:
        logger.info("Received processing request")
        data = request.json or {}
        job_description = data.get("jobDescription", "")
        company_name = data.get("companyName", "")
        custom_instructions = data.get("customInstructions", "")
        personal_info = data.get("personalInfo", {})
        model = data.get("model") or get_default_model()

        logger.debug(f"Job description length: {len(job_description)}")
        logger.debug(f"Company name: {company_name}")
        logger.debug(f"Custom instructions length: {len(custom_instructions)}")
        logger.debug(f"Selected model: {model}")

        if not is_allowed_model(model):
            return (
                jsonify({"error": f"Invalid model '{model}'. Please use /models to fetch allowlisted models."}),
                400,
            )

        result = generate_cover_letter(
            job_description,
            company_name,
            custom_instructions,
            personal_info,
            model,
        )
        if "error" in result:
            return jsonify(result), 500

        return jsonify(result), 200
    except Exception as exc:
        logger.error(f"Error in process endpoint: {exc}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(exc), "traceback": traceback.format_exc()}), 500


@app.route("/answer-questions", methods=["POST"])
def answer_questions():
    try:
        logger.info("Received question answering request")
        data = request.json or {}
        job_description = data.get("jobDescription", "")
        company_name = data.get("companyName", "")
        custom_instructions = data.get("customInstructions", "")
        personal_info = data.get("personalInfo", {})
        questions = data.get("questions", "")
        model = data.get("model") or get_default_model()

        logger.debug(f"Questions length: {len(str(questions))}")
        logger.debug(f"Company name: {company_name}")
        logger.debug(f"Selected model: {model}")

        if not str(questions).strip():
            return jsonify({"error": "Please provide at least one application question"}), 400

        if not is_allowed_model(model):
            return (
                jsonify({"error": f"Invalid model '{model}'. Please use /models to fetch allowlisted models."}),
                400,
            )

        result = generate_job_question_answers(
            job_description,
            company_name,
            custom_instructions,
            personal_info,
            questions,
            model,
        )
        if "error" in result:
            status_code = 400 if "Please provide at least one application question" in result["error"] else 500
            return jsonify(result), status_code

        return jsonify(result), 200
    except Exception as exc:
        logger.error(f"Error in answer_questions endpoint: {exc}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(exc), "traceback": traceback.format_exc()}), 500


if __name__ == "__main__":
    logger.info("Starting API service on port 5001")
    app.run(debug=True, port=5001)
