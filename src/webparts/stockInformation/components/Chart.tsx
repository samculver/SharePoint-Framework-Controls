import * as React from 'react';
import styles from './Chart.module.scss';

export interface IChartProps {
    // ?? props or state?
    data: Array<any>
}

// could maybe be a stateless component
export interface IChartState {
    svgHeight: number;
    svgWidth: number;
    data: Array<any>;
}

export default class Chart extends React.Component<IChartProps, IChartState> {

    constructor(props: IChartProps) {
      super(props);
      this.state = {
        svgHeight: 300,  
        svgWidth: 700,
        data: this.createFakeData()
      };
    }

    public render(): React.ReactElement<IChartProps> {

        const width = this.state.svgWidth;
        const height = this.state.svgHeight;
        const maxValue = 123; // ??
        const xAxisLabels = ['1','2'];
        const yAxisLabels = ['a','b'];

        return (
            
            <div className={`${styles.chartContainer}`}>
                <svg viewBox={`0 0 ${this.state.svgWidth} ${this.state.svgHeight}`}>
                    <Line data={this.state.data} width={width} height={height} />
                    <XAxis labels={ xAxisLabels } maxValue={ maxValue } width={ width } height={ height } />
                    <YAxis labels={ yAxisLabels } width={ width } height={ height } />
                </svg>
            </div>
        );
    }

    private createFakeData(){
        // This function creates data that doesn't look entirely random
        const data = []
        for (let x = 0; x <= 30; x++) {
            const random = Math.random();
            const temp = data.length > 0 ? data[data.length-1].y : 50;
            const y = random >= .45 ? temp + Math.floor(random * 20) : temp - Math.floor(random * 20);
            data.push({x,y})
        }
        return data;
    }
}

export class Line extends React.Component<any, any> {

    public render(): React.ReactElement<any> {

        const {data, color} = this.props;
        let pathData = "M " + this.getSvgX(data[0].x) + " " + this.getSvgY(data[0].y) + " ";

        pathData += data.map((point, i) => {
            return "L " + this.getSvgX(point.x) + " " + this.getSvgY(point.y) + " ";
        });

        return (
            <path className={`${styles.linePath}`} d={pathData} style={{stroke: '#2196F3'}} />
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
        const {svgWidth} = this.props;
        return (x / this.getMaxX() * svgWidth);
    }
    private getSvgY(y) {
        const {svgHeight} = this.props;
        return svgHeight - (y / this.getMaxY() * svgHeight);
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
