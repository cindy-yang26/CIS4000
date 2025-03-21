package com.cis4000.examify.services;

import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import com.cis4000.examify.models.Question;

public class StatisticsExtractor {

    private static final DecimalFormat df = new DecimalFormat("0.###");

    public static Question.Stats extractStatistics(Map<String, Object> questionStat) {
        String questionType = (String) questionStat.get("question_type");

        switch (questionType) {
            case "multiple_choice_question":
                return extractMultipleChoiceStats(questionStat);
            case "essay_question":
                return extractEssayQuestionStats(questionStat);
            case "true_false_question":
                return extractTrueFalseStats(questionStat);
            case "numerical_question":
                return extractNumericalStats(questionStat);
            default:
                return new Question.Stats("N/A", "N/A", "N/A", "N/A", "N/A");
        }
    }

    private static Question.Stats extractNumericalStats(Map<String, Object> questionStat) {
        int correctCount = Integer.parseInt(questionStat.getOrDefault("correct", "0").toString());
        int incorrectCount = Integer.parseInt(questionStat.getOrDefault("incorrect", "0").toString());
    
        List<Double> values = new ArrayList<>();
        
        // List<Map<String, Object>> answers = (List<Map<String, Object>>) questionStat.get("answers");
        // for (Map<String, Object> answer : answers) {
        //     if (answer.containsKey("value")) {
        //         List<Double> answerValues = (List<Double>) answer.get("value");
        //         values.addAll(answerValues);
        //     }
        // }
    
        for (int i = 0; i < correctCount; i++) values.add(1.0);
        for (int i = 0; i < incorrectCount; i++) values.add(0.0);
    
        double mean = values.stream().mapToDouble(v -> v).average().orElse(0.0);
        double stdDev = calculateStandardDeviation(values, mean);
        double median = calculateMedian(values);
        double min = incorrectCount > 0 ? 0 : 1;
        double max = correctCount > 0 ? 1 : 0;
    
        return new Question.Stats(
            df.format(mean), 
            df.format(median), 
            df.format(stdDev), 
            df.format(min), 
            df.format(max)
        );
    }

    private static Question.Stats extractMultipleChoiceStats(Map<String, Object> questionStat) {
        double mean = Double.parseDouble(questionStat.getOrDefault("correct_student_ratio", "0.0").toString());
        double stdDev = Double.parseDouble(questionStat.getOrDefault("stdev", "0.0").toString());

        int correctCount = Integer.parseInt(questionStat.getOrDefault("correct_student_count", "0").toString());
        int incorrectCount = Integer.parseInt(questionStat.getOrDefault("incorrect_student_count", "0").toString());

        double min = (incorrectCount > 0) ? 0.0 : 1.0;
        double max = (correctCount > 0) ? 1.0 : 0.0;

        List<Integer> scores = new ArrayList<>();
        for (int i = 0; i < correctCount; i++) scores.add(1);
        for (int i = 0; i < incorrectCount; i++) scores.add(0);

        double median = calculateMedian(scores);

        return new Question.Stats(
            df.format(mean), 
            df.format(median), 
            df.format(stdDev), 
            df.format(min), 
            df.format(max)
        );
    }

    private static Question.Stats extractTrueFalseStats(Map<String, Object> questionStat) {
        double mean = Double.parseDouble(questionStat.getOrDefault("correct_student_ratio", "0.0").toString());
    
        int correctCount = Integer.parseInt(questionStat.getOrDefault("correct_student_count", "0").toString());
        int incorrectCount = Integer.parseInt(questionStat.getOrDefault("incorrect_student_count", "0").toString());
    
        double min = (incorrectCount > 0) ? 0.0 : 1.0;
        double max = (correctCount > 0) ? 1.0 : 0.0;
    
        List<Integer> scores = new ArrayList<>();
        for (int i = 0; i < correctCount; i++) scores.add(1);
        for (int i = 0; i < incorrectCount; i++) scores.add(0);
    
        double median = calculateMedian(scores);
        double stdDev = calculateStandardDeviation(scores, mean);
    
        return new Question.Stats(
            df.format(mean), 
            df.format(median), 
            df.format(stdDev), 
            df.format(min), 
            df.format(max)
        );
    }

    private static Question.Stats extractEssayQuestionStats(Map<String, Object> questionStat) {
        List<Map<String, Object>> pointDistribution = (List<Map<String, Object>>) questionStat.get("point_distribution");

        if (pointDistribution == null || pointDistribution.isEmpty()) {
            return new Question.Stats("0.0", "0.0", "0.0", "0.0", "0.0");
        }

        List<Integer> scores = new ArrayList<>();
        double sum = 0;
        int totalResponses = 0;

        for (Map<String, Object> entry : pointDistribution) {
            int score = ((Number) entry.get("score")).intValue();
            int count = ((Number) entry.get("count")).intValue();

            for (int i = 0; i < count; i++) {
                scores.add(score);
            }

            sum += score * count;
            totalResponses += count;
        }

        double mean = (totalResponses == 0) ? 0.0 : sum / totalResponses;
        double median = calculateMedian(scores);
        double stdDev = calculateStandardDeviation(scores, mean);
        double min = (scores.isEmpty()) ? 0.0 : Collections.min(scores);
        double max = (scores.isEmpty()) ? 0.0 : Collections.max(scores);

        return new Question.Stats(
            df.format(mean), 
            df.format(median), 
            df.format(stdDev), 
            df.format(min), 
            df.format(max)
        );
    }

    private static double calculateMedian(List<? extends Number> values) {
        if (values.isEmpty()) return 0.0;

        List<Double> sortedValues = new ArrayList<>();
        for (Number value : values) {
            sortedValues.add(value.doubleValue());
        }

        Collections.sort(sortedValues);
        int size = sortedValues.size();

        if (size % 2 == 1) {
            return sortedValues.get(size / 2);
        } else {
            return (sortedValues.get(size / 2 - 1) + sortedValues.get(size / 2)) / 2.0;
        }
    }

    private static double calculateStandardDeviation(List<? extends Number> values, double mean) {
        if (values.isEmpty()) return 0.0;
    
        List<Double> doubleValues = new ArrayList<>();
        for (Number value : values) {
            doubleValues.add(value.doubleValue()); 
        }
    
        double sumSquaredDiffs = 0.0;
        for (double value : doubleValues) {
            sumSquaredDiffs += Math.pow(value - mean, 2);
        }
    
        return Math.sqrt(sumSquaredDiffs / doubleValues.size());
    }
    
    
}
