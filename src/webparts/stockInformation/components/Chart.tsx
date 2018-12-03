import * as React from 'react';
import styles from './Chart.module.scss';

export interface IChartProps {
    // ?? props or state?
    data: Array<any>
    svgHeight: number;
    svgWidth: number;
}

// could maybe be a stateless ?
export interface IChartState {
    
}

export default class Chart extends React.Component<IChartProps, IChartState> {

    public render(): React.ReactElement<IChartProps> {

        const width = this.props.svgWidth;
        const height = this.props.svgHeight;
        const maxValue = 123; // ??
        const xAxisLabels = ['1','2'];
        const yAxisLabels = ['a','b'];
        const {data} = this.props;

        return (
            
            <div className={`${styles.chartContainer}`}>
                <svg viewBox={`0 0 ${this.props.svgWidth} ${this.props.svgHeight}`}>
                    <Line data={data} width={width} height={height} />
                    <XAxis labels={ xAxisLabels } maxValue={ maxValue } width={ width } height={ height } />
                    <YAxis labels={ yAxisLabels } width={ width } height={ height } />
                </svg>
            </div>
        );
    }
}

export class Line extends React.Component<any, any> {

    public render(): React.ReactElement<any> {

        const {data} = this.props;
        console.log(data);
        let pathData = "M " + this.getSvgX(data[0].x) + " " + this.getSvgY(data[0].y) + " ";

        pathData += data.map((point, i) => {
            return "L " + this.getSvgX(point.x) + " " + this.getSvgY(point.y) + " ";
        });

        return (
            <path className={`${styles.linePath}`} d={pathData} />
        );
    }

    private getMinX() {
        const {data} = this.props;
        return data[0].x;
    }
    private getMaxX() {
        const {data} = this.props;
        return data[data.length - 1].x;
    }
    private getMinY() {
        const {data} = this.props;
        return data.reduce((min, p) => p.y < min ? p.y : min, data[0].y);
    }
    private getMaxY() {
        const {data} = this.props;
        return data.reduce((max, p) => p.y > max ? p.y : max, data[0].y);
    }
    private getSvgX(x) {
        const {width} = this.props;
        return (x / this.getMaxX() * width);
    }
    private getSvgY(y) {
        const {height} = this.props;
        return height - (y / this.getMaxY() * height);
    }
}

export class XAxis extends React.Component<any, any> {

    public render(): React.ReactElement<any> {

        //const minX = this.getMinX(), maxX = this.getMaxX();
        //const minY = this.getMinY(), maxY = this.getMaxY();

        return (
            <g className="linechart_axis">{/*
                <line
                    x1={this.getSvgX(minX)} y1={this.getSvgY(minY)}
                    x2={this.getSvgX(maxX)} y2={this.getSvgY(minY)} />
                <line
                    x1={this.getSvgX(minX)} y1={this.getSvgY(minY)}
            x2={this.getSvgX(minX)} y2={this.getSvgY(maxY)} />*/}
            </g>
        );
    }
}

export class YAxis extends React.Component<any, any> {

    public render(): React.ReactElement<any> {

        //const minX = this.getMinX(), maxX = this.getMaxX();
        //const minY = this.getMinY(), maxY = this.getMaxY();

        return (
            <g className="linechart_axis">{/*
                <line
                    x1={this.getSvgX(minX)} y1={this.getSvgY(minY)}
                    x2={this.getSvgX(maxX)} y2={this.getSvgY(minY)} />
                <line
                    x1={this.getSvgX(minX)} y1={this.getSvgY(minY)}
            x2={this.getSvgX(minX)} y2={this.getSvgY(maxY)} />*/}
            </g>
        );
    }
}
