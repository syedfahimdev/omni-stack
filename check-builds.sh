#!/bin/bash

echo "🔍 Monitoring GitHub Actions builds until they pass..."
echo "Press Ctrl+C to stop"
echo ""

while true; do
    echo "=========================================="
    echo "Checking build status at $(date '+%Y-%m-%d %H:%M:%S')"
    echo "=========================================="
    
    # Get latest runs
    gh run list --limit 5 --json status,conclusion,name,workflowName,number,createdAt --jq '.[] | "\(.status | ascii_upcase) | \(.conclusion // "N/A") | \(.workflowName) | Run #\(.number)"'
    
    # Check if all recent runs are completed and successful
    ALL_PASSED=$(gh run list --limit 3 --json status,conclusion --jq '[.[] | select(.status == "completed") | .conclusion] | all(. == "success" or . == "skipped")')
    
    if [ "$ALL_PASSED" = "true" ]; then
        echo ""
        echo "✅ All builds have passed or been skipped!"
        break
    fi
    
    # Check if any are still in progress
    IN_PROGRESS=$(gh run list --limit 3 --json status --jq '[.[] | .status] | any(. == "in_progress" or . == "queued")')
    
    if [ "$IN_PROGRESS" = "true" ]; then
        echo ""
        echo "⏳ Builds still in progress, waiting 10 seconds..."
        sleep 10
    else
        echo ""
        echo "❌ Some builds may have failed. Checking details..."
        sleep 5
    fi
    
    echo ""
done

echo ""
echo "🎉 Build monitoring complete!"

