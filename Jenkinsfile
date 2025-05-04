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

        stage('Debug SSH Key') {
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: SSH_KEY_CREDENTIALS, keyFileVariable: 'TEMP_SSH_KEY')]) {
                        // Set the correct permissions for the SSH key
                        sh "chmod 600 \"${TEMP_SSH_KEY}\""
                        // Start the SSH agent
                        sh 'eval $(ssh-agent -s)'
                        // Add the SSH key to the agent
                        sh "ssh-add \"${TEMP_SSH_KEY}\""
                        // List the identities in the SSH agent
                        sh 'ssh-add -l'

                        // Debug SSH connection to EC2 instance
                        sh "ssh -v -i \"${TEMP_SSH_KEY}\" -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} 'echo SSH connection successful'"
                    }
                }
            }
        }

        stage('Copy Files to EC2') {
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: SSH_KEY_CREDENTIALS, keyFileVariable: 'TEMP_SSH_KEY')]) {
                        sh """
                            chmod 600 "${TEMP_SSH_KEY}"
                            eval \$(ssh-agent -s)
                            ssh-add "${TEMP_SSH_KEY}"

                            echo "Debugging SSH connection..."
                            ssh -v -i "${TEMP_SSH_KEY}" -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} 'echo SSH connection successful'

                            if [ "\${params.DRY_RUN}" = "false" ]; then
                                echo "Copying files to EC2..."
                                scp -v -i "${TEMP_SSH_KEY}" -o StrictHostKeyChecking=no -r \\
                                    ./intelligence \\
                                    
                                    ${EC2_USER}@${EC2_IP}:/home/${EC2_USER}/${REPO_NAME}/
                            else
                                echo "Dry run mode: Skipping file copy."
                            fi
                        """
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
