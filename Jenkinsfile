pipeline {
    agent any

    environment {
        EC2_USER = 'ec2-user'
        EC2_IP = '3.68.187.140'
        REPO_NAME = 'Biolabs'
        SSH_KEY_FILE = 'aws-biolabs-key-file'  // Use the file credential
        GIT_CREDENTIALS = 'github-credentials'
    }

    parameters {
        booleanParam(name: 'DRY_RUN', defaultValue: true, description: 'Run the pipeline in dry run mode')
    }

    stages {
        stage('Cleanup Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout') {
            steps {
                git credentialsId: "${GIT_CREDENTIALS}", 
                    url: 'https://github.com/shiyasali23/Biolabs.git', 
                    branch: 'master'
            }
        }

        stage('Test SSH Connection') {
            steps {
                withCredentials([file(credentialsId: "${SSH_KEY_FILE}", variable: 'SSH_KEY')]) {
                    sh """
                        # Set key permissions
                        chmod 600 "${SSH_KEY}"
                        
                        # Test connection with verbose output for debugging
                        ssh -v -i "${SSH_KEY}" -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} 'echo SSH connection successful'
                    """
                }
            }
        }
        
        stage('Deploy to EC2') {
            when {
                expression { return params.DRY_RUN == false }
            }
            steps {
                withCredentials([file(credentialsId: "${SSH_KEY_FILE}", variable: 'SSH_KEY')]) {
                    sh """
                        chmod 600 "${SSH_KEY}"
                        
                        echo "Copying files to EC2..."
                        scp -i "${SSH_KEY}" -o StrictHostKeyChecking=no -r \\
                            ./intelligence \\
                            .dockerignore \\
                            docker-compose.dev.yml \\
                            docker-compose.prod.yml \\
                            nginx \\
                            ${EC2_USER}@${EC2_IP}:/home/${EC2_USER}/${REPO_NAME}/
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed! Check the logs for details.'
        }
    }
}