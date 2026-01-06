FROM python:3.11-slim

# Install common data science and AI packages
RUN pip install --no-cache-dir \
    boto3==1.34.* \
    requests==2.31.* \
    numpy==1.26.* \
    pandas==2.1.* \
    matplotlib==3.8.* \
    pillow==10.1.* \
    python-dotenv==1.0.* \
    openai==1.6.* \
    anthropic==0.8.* \
    ibm-watsonx-ai==1.0.* \
    ibm-watson-machine-learning==1.0.*

# Create execution directory
WORKDIR /code

# Copy execution scripts
COPY execute.py /code/
COPY server.py /code/
COPY requirements.txt /code/

# Set up non-root user for security
RUN useradd -m -u 1000 coderunner && \
    chown -R coderunner:coderunner /code

USER coderunner

# Expose port for HTTP server
EXPOSE 8080

# Run HTTP server (not batch script)
CMD ["python", "server.py", "8080"]
