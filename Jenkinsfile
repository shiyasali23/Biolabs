pipeline {
    agent any

    environment {
        EC2_USER = 'ec2-user'
        EC2_IP = '3.68.187.140'
        REPO_NAME = 'Biolabs'
        SSH_KEY_CREDENTIALS = 'aws-biolabs-key'
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
                script {
                    git credentialsId: "${GIT_CREDENTIALS}", url: 'https://github.com/shiyasali23/Biolabs.git', branch: 'master'
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    // Use sshagent instead of manual ssh-agent setup
                    sshagent(['aws-biolabs-key']) {
                        // Test SSH connection to EC2 instance
                        sh "ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} 'echo SSH connection successful'"

                        if (params.DRY_RUN != true) {
                            echo "Copying files to EC2..."
                            sh """
                                scp -o StrictHostKeyChecking=no -r \\
                                    ./intelligence \\
                                    .dockerignore \\
                                    docker-compose.dev.yml \\
                                    docker-compose.prod.yml \\
                                    nginx \\
                                    ${EC2_USER}@${EC2_IP}:/home/${EC2_USER}/${REPO_NAME}/
                            """
                        } else {
                            echo "Dry run mode: Skipping file copy."
                        }
                    }
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