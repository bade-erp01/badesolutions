"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import moment from "moment";
import {EXPRESS_PRIVATE_URL} from "../../../Functions/Functions";

/**
 * GenerealSalesMargin
 * - Client component that fetches invoice/warehouse data and renders two Plotly charts:
 *   1) Pie chart: revenue by warehouse
 *   2) Line chart: month-by-month revenue for current year
 *
 * Props:
 * - fetchUrl: endpoint to fetch invoice records (defaults to the templated path used in original code)
 * - businessColor: default color for charts
 */
export default function GenerealSalesMargin({
	// fetchUrl = `${EXPRESS_PRIVATE_URL}/api/getInvoiceRecords`,
	businessColor = 'black',
	yearlysales,
	warehouses
}) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [invoices, setInvoices] = useState(Array.isArray(yearlysales) ? yearlysales : []);
	const [whs, setWhs] = useState(Array.isArray(warehouses) ? warehouses : []);

	const pieRef = useRef(null);
	const lineRef = useRef(null);
	const plotlyRef = useRef(null);

	// Safe numeric conversion
	const toNum = (v) => (typeof v === 'number' ? v : parseFloat(v) || 0);

	// Aggregate data in a single pass for performance
	const computeAggregates = useCallback(() => {
		const year = moment().year();
		const monthTotals = new Array(12).fill(0);
		const whTotals = new Map();

		// Initialize warehouse totals to preserve ordering
		whs.forEach((wh) => {
			whTotals.set(String(wh._id), 0);
		});

		for (let i = 0; i < invoices.length; i++) {
			const inv = invoices[i];
			if (!inv) continue;
			const status = String(inv.billStatus || '').toLowerCase();
			if (status === 'cancelled') continue;

			const s = moment(inv.startDate);
			if (s.isValid() && s.year() === year) {
				monthTotals[s.month()] += toNum(inv.grandTotal);
			}

			const whId = inv.whId ? String(inv.whId) : null;
			if (whId && whTotals.has(whId)) {
				whTotals.set(whId, whTotals.get(whId) + toNum(inv.grandTotal));
			}
		}

		return { monthTotals, whTotals };
	}, [invoices, whs]);

	// Render charts when invoices or warehouses change
	useEffect(() => {
		if (loading) return;
		let mounted = true;

		(async () => {
			try {
				// dynamic import Plotly only on client at runtime
				const Plotly = (await import('plotly.js-dist-min')).default || (await import('plotly.js-dist-min'));
				plotlyRef.current = Plotly;

				const { monthTotals, whTotals } = computeAggregates();

				// PIE chart: revenue by warehouse
				const NDxArray = whs.map((w) => w.WHName || 'Unknown');
				const NDyArray = whs.map((w) => whTotals.get(String(w._id)) || 0);
				const pieData = [{ labels: NDxArray, values: NDyArray, type: 'pie' }];
				const pieLayout = { title: 'REVENUE GENERATION MARGIN' };
				if (mounted && pieRef.current) Plotly.newPlot(pieRef.current, pieData, pieLayout);

				// Line chart: month-by-month
				const xArray = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
				const yArray = monthTotals.map((v) => Number(v.toFixed(2)));
				const lineData = [{ x: xArray, y: yArray, type: 'scatter', mode: 'bar', marker: { color: businessColor } }];
				const lineLayout = { title: 'M/M SALES TURN OVER' };
				if (mounted && lineRef.current) Plotly.newPlot(lineRef.current, lineData, lineLayout);
			} catch (err) {
				setError(err?.message || String(err));
			}
		})();

		return () => {
			mounted = false;
			try {
				const Plotly = plotlyRef.current;
				if (Plotly) {
					if (pieRef.current) Plotly.purge(pieRef.current);
					if (lineRef.current) Plotly.purge(lineRef.current);
				}
			} catch (_) {}
		};
	}, [loading, computeAggregates, whs, businessColor]);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg text-gray-500 font-semibold">
					General Sales Margin for {moment().format("YYYY")}
				</h3>
				<div className="text-sm text-gray-500">
					{loading ? "Loading..." : error ? "Error" : "12 months performance"}
				</div>
			</div>

			{error && <div className="text-sm text-red-600">{error}</div>}

			<div>
				<div ref={lineRef} id="myPlot" style={{ width: "100%", height: "25%" }}/>
				<hr/>
				{/* <div ref={pieRef} id="PIE" style={{ width: '100%', height: "50%" }} /> */}
			</div>
		</div>
	);
}
